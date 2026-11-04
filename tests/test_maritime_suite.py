import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base
from core.models.auth import Tenant
from core.models.admin import AuditLog
from modules.maritime.models import RateCard, Quotation, Shipment, MilestoneEvent, HouseBillOfLading
from modules.maritime.service import MaritimeFreightService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_maritime_quotation_persistence_and_math(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="Ocean Forwarders", slug="ocean-forwarders")
    db_session.add(tenant)
    db_session.commit()

    quote = MaritimeFreightService.calculate_freight_quote(
        db=db_session,
        tenant_id=tenant.id,
        trade_lane="ASIA-USEC",
        container_type="40HC",
        container_count=2,
        baf_fuel_surcharge=400.0,
        terminal_handling_charges=260.0,
        peak_season_surcharge=150.0
    )

    assert quote["trade_lane"] == "ASIA-USEC"
    assert quote["container_type"] == "40HC"
    assert quote["container_count"] == 2
    # Base 3950 + 810 surcharges = 4760 * 2 = 9520
    assert quote["base_rate_per_unit"] == 3950.0
    assert quote["surcharges_breakdown"]["total_surcharges_per_unit"] == 810.0
    assert quote["total_freight_quote"] == 9520.0

    # Verify Quotation persisted in DB
    saved_quote = db_session.query(Quotation).filter(
        Quotation.tenant_id == tenant.id,
        Quotation.quote_number == quote["quote_number"]
    ).first()
    assert saved_quote is not None
    assert float(saved_quote.total_amount) == 9520.0

def test_shipment_timeline_and_detention_alert(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="Global Logistics", slug="global-logistics")
    db_session.add(tenant)
    db_session.commit()

    timeline = MaritimeFreightService.get_shipment_timeline(db_session, tenant.id, "BL-MAEU-9821")
    assert timeline["bl_number"] == "BL-MAEU-9821"
    assert len(timeline["events"]) >= 5

    # Check for detention alert when free days <= 2
    alert_events = [e for e in timeline["events"] if e["detention_alert"] is True]
    assert len(alert_events) >= 1
    assert alert_events[0]["demurrage_free_days_remaining"] <= 2

def test_house_bill_of_lading_generation(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="TransGlobal Maritime", slug="transglobal-maritime")
    db_session.add(tenant)
    db_session.commit()

    hbl = MaritimeFreightService.create_house_bill_of_lading(
        db=db_session,
        tenant_id=tenant.id,
        shipper_name="Apex Electronics Corp",
        consignee_name="Pacific Distributors Inc",
        vessel_voyage="EVER GIVEN / 0411E",
        port_of_loading="Shenzhen (Yantian)",
        port_of_discharge="Los Angeles (USLAX)",
        container_numbers="EMCU9128340, EMCU9128341",
        gross_weight_kg=38400.0,
        measurement_cbm=124.5
    )

    assert hbl.hbl_number.startswith("HBL-2026-")
    assert hbl.status == "issued"
    assert hbl.tenant_id == tenant.id


def test_lfd_demurrage_calculation_and_carrier_tracking_contract(db_session):
    tenant = Tenant(id=uuid.uuid4(), name="Pacific NVOCC", slug="pacific-nvocc")
    db_session.add(tenant)
    db_session.commit()

    # Record milestone with 1 free day remaining -> triggers detention alert & demurrage risk estimate
    evt = MaritimeFreightService.record_shipment_milestone(
        db=db_session,
        tenant_id=tenant.id,
        bl_number="BL-MAEU-9821",
        milestone_code="GATE_HOLD",
        port_or_location="Long Beach Terminal TTI",
        demurrage_free_days_remaining=1,
    )
    assert evt["detention_alert"] is True
    assert evt["estimated_daily_demurrage_usd"] > 0

    # Carrier tracking adapter contract explicitly identifies contract_stub mode (never claims live EDI)
    tracking = MaritimeFreightService.fetch_carrier_tracking_status(db_session, tenant.id, "BL-MAEU-9821")
    assert tracking["bl_number"] == "BL-MAEU-9821"
    assert tracking["integration_mode"] == "contract_stub"
    assert tracking["live_carrier_connection"] is False



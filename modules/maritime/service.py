from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from core.services.audit_service import AuditService
from modules.maritime.models import Enquiry, Quotation, Shipment, RateCard, MilestoneEvent, HouseBillOfLading

class MaritimeFreightService:
    """
    Maritime logistics quote engine, rate card manager, and container milestone event tracker
    backed by PostgreSQL persistence.
    """
    DEFAULT_RATES = [
        {"carrier": "Maersk Line", "lane": "ASIA-USWC", "type": "20GP", "base": 1850.0, "baf": 350.0, "thc": 220.0, "pss": 150.0},
        {"carrier": "Maersk Line", "lane": "ASIA-USWC", "type": "40HC", "base": 2650.0, "baf": 380.0, "thc": 250.0, "pss": 150.0},
        {"carrier": "MSC", "lane": "ASIA-USEC", "type": "20GP", "base": 2850.0, "baf": 380.0, "thc": 240.0, "pss": 150.0},
        {"carrier": "MSC", "lane": "ASIA-USEC", "type": "40HC", "base": 3950.0, "baf": 400.0, "thc": 260.0, "pss": 150.0},
        {"carrier": "CMA CGM", "lane": "EUR-ASIA", "type": "20GP", "base": 1250.0, "baf": 290.0, "thc": 210.0, "pss": 100.0},
        {"carrier": "CMA CGM", "lane": "EUR-ASIA", "type": "40HC", "base": 1750.0, "baf": 310.0, "thc": 220.0, "pss": 100.0},
        {"carrier": "Hapag-Lloyd", "lane": "TRANSATLANTIC", "type": "20GP", "base": 2100.0, "baf": 320.0, "thc": 230.0, "pss": 120.0},
        {"carrier": "Hapag-Lloyd", "lane": "TRANSATLANTIC", "type": "40HC", "base": 2900.0, "baf": 350.0, "thc": 240.0, "pss": 120.0},
    ]

    LANE_TRANSIT_DAYS = {
        "ASIA-USWC": 14,
        "ASIA-USEC": 24,
        "EUR-ASIA": 28,
        "TRANSATLANTIC": 11
    }

    @classmethod
    def seed_rate_cards_if_empty(cls, db: Session, tenant_id: uuid.UUID) -> None:
        count = db.query(RateCard).filter(
            RateCard.tenant_id == tenant_id,
            RateCard.status == "active",
        ).count()
        if count == 0:
            for item in cls.DEFAULT_RATES:
                rc = RateCard(
                    id=uuid.uuid4(),
                    tenant_id=tenant_id,
                    carrier_name=item["carrier"],
                    trade_lane=item["lane"],
                    container_type=item["type"],
                    base_rate=item["base"],
                    baf_surcharge=item["baf"],
                    thc_surcharge=item["thc"],
                    pss_surcharge=item["pss"],
                    currency="USD",
                    valid_from=datetime.utcnow(),
                    valid_to=datetime.utcnow() + timedelta(days=90),
                    status="active"
                )
                db.add(rc)
            db.commit()

    @classmethod
    def calculate_freight_quote(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        trade_lane: str,
        container_type: str = "40HC",
        container_count: int = 1,
        baf_fuel_surcharge: Optional[float] = None,
        terminal_handling_charges: Optional[float] = None,
        peak_season_surcharge: Optional[float] = None,
        enquiry_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        cls.seed_rate_cards_if_empty(db, tenant_id)

        lane_clean = trade_lane.upper()
        type_clean = container_type.upper()

        # Query database rate card
        rate_card = db.query(RateCard).filter(
            RateCard.tenant_id == tenant_id,
            RateCard.trade_lane == lane_clean,
            RateCard.container_type == type_clean,
            RateCard.status == "active"
        ).first()

        if rate_card:
            base_rate = float(rate_card.base_rate)
            baf = float(rate_card.baf_surcharge or 0) if baf_fuel_surcharge is None else baf_fuel_surcharge
            thc = float(rate_card.thc_surcharge or 0) if terminal_handling_charges is None else terminal_handling_charges
            pss = float(rate_card.pss_surcharge or 0) if peak_season_surcharge is None else peak_season_surcharge
        else:
            base_rate = 2650.0
            baf = 380.0 if baf_fuel_surcharge is None else baf_fuel_surcharge
            thc = 250.0 if terminal_handling_charges is None else terminal_handling_charges
            pss = 150.0 if peak_season_surcharge is None else peak_season_surcharge

        surcharges_per_unit = baf + thc + pss
        rate_per_unit = base_rate + surcharges_per_unit
        total_quote = round(rate_per_unit * container_count, 2)
        transit_days = cls.LANE_TRANSIT_DAYS.get(lane_clean, 18)

        # Persist formal quotation
        q_count = db.query(Quotation).filter(Quotation.tenant_id == tenant_id).count()
        quote_num = f"QT-2026-{q_count + 101:03d}"
        quotation = Quotation(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            enquiry_id=enquiry_id,
            quote_number=quote_num,
            trade_lane=lane_clean,
            container_type=type_clean,
            container_count=container_count,
            base_rate=base_rate,
            total_surcharges=surcharges_per_unit,
            total_amount=total_quote,
            validity_date=datetime.utcnow() + timedelta(days=14),
            status="sent"
        )
        db.add(quotation)
        db.commit()
        db.refresh(quotation)

        return {
            "quote_id": str(quotation.id),
            "quote_number": quotation.quote_number,
            "trade_lane": lane_clean,
            "container_type": type_clean,
            "container_count": container_count,
            "estimated_transit_days": transit_days,
            "base_rate_per_unit": base_rate,
            "surcharges_breakdown": {
                "baf_fuel": baf,
                "terminal_handling": thc,
                "peak_season": pss,
                "total_surcharges_per_unit": surcharges_per_unit
            },
            "total_rate_per_unit": rate_per_unit,
            "total_freight_quote": total_quote,
            "currency": "USD"
        }

    @classmethod
    def get_or_create_demo_shipment(cls, db: Session, tenant_id: uuid.UUID) -> Shipment:
        shipment = db.query(Shipment).filter(
            Shipment.tenant_id == tenant_id,
            Shipment.bl_number == "BL-MAEU-9821"
        ).first()

        if not shipment:
            shipment = Shipment(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                booking_number="BK-772910",
                bl_number="BL-MAEU-9821",
                vessel="MAERSK MC-KINNEY MOLLER",
                voyage="2610W",
                origin_port="Shanghai (CNSHA)",
                destination_port="Long Beach (USLGB)",
                status="in_transit",
                eta=datetime.utcnow() + timedelta(days=2)
            )
            db.add(shipment)
            db.flush()

            # Seed standard milestones
            milestones = [
                ("GATE_IN", "Shanghai (CNSHA)", -16, "completed", None, False),
                ("VESSEL_LOADED", "Shanghai (CNSHA)", -14, "completed", None, False),
                ("IN_TRANSIT", "Pacific Ocean", -7, "completed", None, False),
                ("DISCHARGED", "Long Beach (USLGB)", -2, "completed", 4, False),
                ("CUSTOMS_CLEARED", "Long Beach (USLGB)", 0, "completed", 2, True),
                ("DELIVERY_OUTBOUND", "Los Angeles Hub", 1, "in_progress", 1, True),
            ]
            for code, loc, days_offset, st, lfd, det in milestones:
                evt = MilestoneEvent(
                    id=uuid.uuid4(),
                    tenant_id=tenant_id,
                    shipment_id=shipment.id,
                    milestone_code=code,
                    port_or_location=loc,
                    event_timestamp=datetime.utcnow() + timedelta(days=days_offset),
                    status=st,
                    demurrage_free_days_remaining=lfd,
                    detention_alert=det
                )
                db.add(evt)

            db.commit()
            db.refresh(shipment)
        return shipment

    @classmethod
    def get_shipment_timeline(cls, db: Session, tenant_id: uuid.UUID, bl_number: str = "BL-MAEU-9821") -> Dict[str, Any]:
        shipment = db.query(Shipment).filter(
            Shipment.tenant_id == tenant_id,
            Shipment.bl_number == bl_number
        ).first()

        if not shipment:
            shipment = cls.get_or_create_demo_shipment(db, tenant_id)

        milestones = db.query(MilestoneEvent).filter(
            MilestoneEvent.tenant_id == tenant_id,
            MilestoneEvent.shipment_id == shipment.id
        ).order_by(MilestoneEvent.event_timestamp.asc()).all()

        return {
            "bl_number": shipment.bl_number,
            "vessel": shipment.vessel,
            "voyage": shipment.voyage,
            "origin": shipment.origin_port,
            "destination": shipment.destination_port,
            "status": shipment.status,
            "events": [
                {
                    "milestone": m.milestone_code,
                    "port": m.port_or_location,
                    "date": m.event_timestamp.strftime("%Y-%m-%d") if m.event_timestamp else None,
                    "status": m.status,
                    "demurrage_free_days_remaining": m.demurrage_free_days_remaining,
                    "detention_alert": m.detention_alert
                }
                for m in milestones
            ]
        }

    @classmethod
    def create_house_bill_of_lading(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        shipper_name: str,
        consignee_name: str,
        vessel_voyage: str,
        port_of_loading: str,
        port_of_discharge: str,
        container_numbers: str,
        gross_weight_kg: float,
        measurement_cbm: float,
        shipment_id: Optional[uuid.UUID] = None
    ) -> HouseBillOfLading:
        hbl_count = db.query(HouseBillOfLading).filter(HouseBillOfLading.tenant_id == tenant_id).count()
        hbl_num = f"HBL-2026-{hbl_count + 8801:04d}"

        hbl = HouseBillOfLading(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            shipment_id=shipment_id,
            hbl_number=hbl_num,
            shipper_name=shipper_name,
            consignee_name=consignee_name,
            vessel_voyage=vessel_voyage,
            port_of_loading=port_of_loading,
            port_of_discharge=port_of_discharge,
            container_numbers=container_numbers,
            gross_weight_kg=gross_weight_kg,
            measurement_cbm=measurement_cbm,
            status="issued"
        )
        db.add(hbl)
        AuditService.record(
            db=db,
            action="maritime.hbl.issued",
            tenant_id=tenant_id,
            resource_type="house_bill_of_lading",
            resource_id=str(hbl.id),
            details={"hbl_number": hbl_num, "vessel_voyage": vessel_voyage},
        )
        db.commit()
        db.refresh(hbl)
        return hbl

    @classmethod
    def approve_rate_card(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        rate_card_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
    ) -> Optional[RateCard]:
        target = db.query(RateCard).filter(
            RateCard.id == rate_card_id,
            RateCard.tenant_id == tenant_id,
        ).first()
        if not target:
            return None

        # Supersede prior active rate cards for the same lane & container type
        db.query(RateCard).filter(
            RateCard.tenant_id == tenant_id,
            RateCard.trade_lane == target.trade_lane,
            RateCard.container_type == target.container_type,
            RateCard.status == "active",
            RateCard.id != target.id,
        ).update({"status": "superseded"})

        target.status = "active"
        AuditService.record(
            db=db,
            action="maritime.rate_card.approved",
            tenant_id=tenant_id,
            user_id=user_id,
            resource_type="rate_card",
            resource_id=str(target.id),
            details={
                "carrier_name": target.carrier_name,
                "trade_lane": target.trade_lane,
                "container_type": target.container_type,
                "base_rate": float(target.base_rate),
            },
        )
        db.commit()
        db.refresh(target)
        return target

    @classmethod
    def list_rate_cards(cls, db: Session, tenant_id: uuid.UUID, status: Optional[str] = None) -> List[RateCard]:
        q = db.query(RateCard).filter(RateCard.tenant_id == tenant_id)
        if status:
            q = q.filter(RateCard.status == status)
        return q.order_by(RateCard.created_at.desc()).all()

    @classmethod
    def record_shipment_milestone(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        bl_number: str,
        milestone_code: str,
        port_or_location: str,
        demurrage_free_days_remaining: Optional[int] = None,
        status: str = "completed",
    ) -> Dict[str, Any]:
        shipment = db.query(Shipment).filter(
            Shipment.tenant_id == tenant_id,
            Shipment.bl_number == bl_number,
        ).first()
        if not shipment:
            shipment = cls.get_or_create_demo_shipment(db, tenant_id)

        detention_alert = demurrage_free_days_remaining is not None and demurrage_free_days_remaining <= 2
        daily_demurrage = 0.0
        if demurrage_free_days_remaining is not None:
            if demurrage_free_days_remaining <= 0:
                daily_demurrage = 250.0
            elif demurrage_free_days_remaining <= 2:
                daily_demurrage = 175.0

        evt = MilestoneEvent(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            shipment_id=shipment.id,
            milestone_code=milestone_code.upper(),
            port_or_location=port_or_location,
            event_timestamp=datetime.utcnow(),
            status=status,
            demurrage_free_days_remaining=demurrage_free_days_remaining,
            detention_alert=detention_alert,
        )
        db.add(evt)
        AuditService.record(
            db=db,
            action="maritime.milestone.recorded",
            tenant_id=tenant_id,
            resource_type="milestone_event",
            resource_id=str(evt.id),
            details={
                "bl_number": shipment.bl_number,
                "milestone_code": evt.milestone_code,
                "detention_alert": detention_alert,
            },
        )
        db.commit()
        db.refresh(evt)
        return {
            "id": str(evt.id),
            "bl_number": shipment.bl_number,
            "milestone_code": evt.milestone_code,
            "port_or_location": evt.port_or_location,
            "demurrage_free_days_remaining": evt.demurrage_free_days_remaining,
            "detention_alert": evt.detention_alert,
            "estimated_daily_demurrage_usd": daily_demurrage,
        }

    @classmethod
    def fetch_carrier_tracking_status(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        bl_number: str,
    ) -> Dict[str, Any]:
        """Carrier tracking integration contract (deterministic local stub — requires EDI/API credentials for live carrier sync)."""
        timeline = cls.get_shipment_timeline(db, tenant_id, bl_number)
        latest = timeline["events"][-1] if timeline["events"] else None
        return {
            "bl_number": timeline["bl_number"],
            "vessel": timeline["vessel"],
            "voyage": timeline["voyage"],
            "latest_milestone": latest,
            "integration_mode": "contract_stub",
            "live_carrier_connection": False,
            "provider_contract": "DCSA_Track_And_Trace_v2.2",
        }

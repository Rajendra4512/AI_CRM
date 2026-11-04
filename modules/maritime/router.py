from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import uuid

from core.database import get_db
from core.models.auth import Tenant, User
from core.services.auth_service import get_current_tenant, get_current_user, require_industry_entitlement
from modules.maritime.service import MaritimeFreightService

router = APIRouter(dependencies=[Depends(require_industry_entitlement("maritime"))])

class FreightQuoteRequest(BaseModel):
    trade_lane: str
    container_type: Optional[str] = "40HC"
    container_count: Optional[int] = 1
    baf_fuel_surcharge: Optional[float] = None
    terminal_handling_charges: Optional[float] = None
    peak_season_surcharge: Optional[float] = None

class HBLCreateRequest(BaseModel):
    shipper_name: str
    consignee_name: str
    vessel_voyage: str
    port_of_loading: str
    port_of_discharge: str
    container_numbers: str
    gross_weight_kg: float
    measurement_cbm: float
    shipment_id: Optional[uuid.UUID] = None


class MilestoneCreateRequest(BaseModel):
    milestone_code: str
    port_or_location: str
    demurrage_free_days_remaining: Optional[int] = None
    status: Optional[str] = "completed"

@router.post("/quote")
def quote_freight(
    req: FreightQuoteRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    return MaritimeFreightService.calculate_freight_quote(
        db=db,
        tenant_id=tenant.id,
        trade_lane=req.trade_lane,
        container_type=req.container_type or "40HC",
        container_count=req.container_count or 1,
        baf_fuel_surcharge=req.baf_fuel_surcharge,
        terminal_handling_charges=req.terminal_handling_charges,
        peak_season_surcharge=req.peak_season_surcharge
    )

@router.get("/shipments/{bl_number}/timeline")
def get_shipment_timeline(
    bl_number: str,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    return MaritimeFreightService.get_shipment_timeline(db, tenant.id, bl_number)

@router.post("/hbl")
def create_hbl(
    req: HBLCreateRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    hbl = MaritimeFreightService.create_house_bill_of_lading(
        db=db,
        tenant_id=tenant.id,
        shipper_name=req.shipper_name,
        consignee_name=req.consignee_name,
        vessel_voyage=req.vessel_voyage,
        port_of_loading=req.port_of_loading,
        port_of_discharge=req.port_of_discharge,
        container_numbers=req.container_numbers,
        gross_weight_kg=req.gross_weight_kg,
        measurement_cbm=req.measurement_cbm,
        shipment_id=req.shipment_id
    )
    return {
        "message": "House Bill of Lading created successfully.",
        "hbl_id": str(hbl.id),
        "hbl_number": hbl.hbl_number,
        "status": hbl.status
    }


@router.get("/rate-cards")
def list_rate_cards(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    cards = MaritimeFreightService.list_rate_cards(db, tenant.id, status=status)
    return {
        "rate_cards": [
            {
                "id": str(c.id),
                "carrier_name": c.carrier_name,
                "trade_lane": c.trade_lane,
                "container_type": c.container_type,
                "base_rate": float(c.base_rate),
                "currency": c.currency,
                "status": c.status,
            }
            for c in cards
        ]
    }


@router.post("/rate-cards/{rate_card_id}/approve")
def approve_rate_card(
    rate_card_id: uuid.UUID,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    user: User = Depends(get_current_user),
):
    approved = MaritimeFreightService.approve_rate_card(db, tenant.id, rate_card_id, user_id=user.id)
    if not approved:
        raise HTTPException(status_code=404, detail="Rate card not found for active tenant")
    return {
        "message": "Rate card approved and published to active quoting engine.",
        "id": str(approved.id),
        "trade_lane": approved.trade_lane,
        "container_type": approved.container_type,
        "base_rate": float(approved.base_rate),
        "status": approved.status,
    }


@router.post("/shipments/{bl_number}/milestones")
def create_shipment_milestone(
    bl_number: str,
    req: MilestoneCreateRequest,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return MaritimeFreightService.record_shipment_milestone(
        db=db,
        tenant_id=tenant.id,
        bl_number=bl_number,
        milestone_code=req.milestone_code,
        port_or_location=req.port_or_location,
        demurrage_free_days_remaining=req.demurrage_free_days_remaining,
        status=req.status or "completed",
    )


@router.get("/tracking/{bl_number}")
def get_carrier_tracking_contract(
    bl_number: str,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return MaritimeFreightService.fetch_carrier_tracking_status(db, tenant.id, bl_number)

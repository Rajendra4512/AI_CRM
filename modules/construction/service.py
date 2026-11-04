from typing import List, Dict, Any, Optional
import csv
import io
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from core.services.audit_service import AuditService
from core.models.crm import Account, Opportunity
from modules.construction.models import RFQ, Estimate, Project, SOVApplication, SOVLineItem, ChangeEvent, FieldTimeMaterial

class ConstructionSOVService:
    @staticmethod
    def calculate_sov_line(
        line_item_id: str,
        description: str,
        scheduled_value: float,
        work_previous: float,
        work_current: float,
        stored_materials: float = 0.0,
        retainage_rate_pct: float = 10.0
    ) -> Dict[str, Any]:
        total_completed_stored = work_previous + work_current + stored_materials
        pct_complete = round((total_completed_stored / scheduled_value * 100), 2) if scheduled_value > 0 else 0.0
        retainage_amount = round(total_completed_stored * (retainage_rate_pct / 100.0), 2)
        total_earned_less_retainage = round(total_completed_stored - retainage_amount, 2)
        previous_earned_less_retainage = round(work_previous * (1 - (retainage_rate_pct / 100.0)), 2)
        current_payment_due = round(total_earned_less_retainage - previous_earned_less_retainage, 2)
        balance_to_finish = round(scheduled_value - total_completed_stored, 2)

        return {
            "line_item_id": line_item_id,
            "description": description,
            "scheduled_value": scheduled_value,
            "work_previous": work_previous,
            "work_current": work_current,
            "stored_materials": stored_materials,
            "total_completed_stored": total_completed_stored,
            "pct_complete": pct_complete,
            "retainage_amount": retainage_amount,
            "current_payment_due": current_payment_due,
            "balance_to_finish": balance_to_finish
        }

    @staticmethod
    def calculate_sov_application(lines: List[Dict[str, Any]], retainage_rate_pct: float = 10.0) -> Dict[str, Any]:
        processed_lines = [
            ConstructionSOVService.calculate_sov_line(
                line_item_id=str(l.get("line_item_id", f"line-{idx+1}")),
                description=str(l.get("description", "Scope Item")),
                scheduled_value=float(l.get("scheduled_value", 0.0)),
                work_previous=float(l.get("work_previous", 0.0)),
                work_current=float(l.get("work_current", 0.0)),
                stored_materials=float(l.get("stored_materials", 0.0)),
                retainage_rate_pct=retainage_rate_pct
            )
            for idx, l in enumerate(lines)
        ]

        total_contract_value = sum(l["scheduled_value"] for l in processed_lines)
        total_completed = sum(l["total_completed_stored"] for l in processed_lines)
        total_retainage = sum(l["retainage_amount"] for l in processed_lines)
        total_current_due = sum(l["current_payment_due"] for l in processed_lines)
        total_balance_to_finish = sum(l["balance_to_finish"] for l in processed_lines)
        overall_pct = round((total_completed / total_contract_value * 100), 2) if total_contract_value > 0 else 0.0

        return {
            "total_contract_value": total_contract_value,
            "total_completed": total_completed,
            "overall_pct_complete": overall_pct,
            "total_retainage": total_retainage,
            "total_current_payment_due": total_current_due,
            "balance_to_finish": total_balance_to_finish,
            "lines": processed_lines
        }

    @classmethod
    def get_or_create_demo_project(cls, db: Session, tenant_id: uuid.UUID) -> Project:
        project = db.query(Project).filter(Project.tenant_id == tenant_id).first()
        if not project:
            project = Project(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                project_name="Commercial Tower - Phase 2",
                status="active",
                budget=500000.0,
                start_date=datetime.utcnow()
            )
            db.add(project)
            db.commit()
            db.refresh(project)
        return project

    @classmethod
    def persist_sov_application(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        project_id: uuid.UUID,
        application_number: int,
        lines: List[Dict[str, Any]],
        retainage_rate_pct: float = 10.0,
        status: str = "submitted",
        actor_id: Optional[uuid.UUID] = None,
    ) -> SOVApplication:
        project = db.query(Project).filter(Project.id == project_id, Project.tenant_id == tenant_id).first()
        if not project:
            raise ValueError("Project not found for active tenant.")

        # Auto-carry previous billing from Application N-1 when omitted
        prev_totals: Dict[str, float] = {}
        if application_number > 1:
            prev_app = db.query(SOVApplication).filter(
                SOVApplication.tenant_id == tenant_id,
                SOVApplication.project_id == project_id,
                SOVApplication.application_number == application_number - 1,
            ).first()
            if prev_app:
                for pl in prev_app.line_items:
                    prev_totals[pl.line_item_code] = float(pl.total_completed_stored or 0.0)

        enriched_lines = []
        for idx, raw_line in enumerate(lines):
            item = dict(raw_line)
            code = str(item.get("line_item_id", f"line-{idx+1}"))
            if float(item.get("work_previous") or 0.0) == 0.0 and code in prev_totals:
                item["work_previous"] = prev_totals[code]
            enriched_lines.append(item)

        # Check idempotency / duplicates
        existing = db.query(SOVApplication).filter(
            SOVApplication.tenant_id == tenant_id,
            SOVApplication.project_id == project_id,
            SOVApplication.application_number == application_number
        ).first()

        if existing:
            if existing.status == "approved":
                raise ValueError(f"SOV Application #{application_number} is already approved and locked against modifications.")
            # Delete old line items and update existing application
            db.query(SOVLineItem).filter(SOVLineItem.application_id == existing.id).delete()
            app_record = existing
        else:
            app_record = SOVApplication(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                project_id=project_id,
                application_number=application_number
            )
            db.add(app_record)

        # Calculate AIA line-item breakdown
        calc_result = cls.calculate_sov_application(enriched_lines, retainage_rate_pct)

        app_record.retainage_rate_pct = retainage_rate_pct
        app_record.total_contract_value = calc_result["total_contract_value"]
        app_record.total_completed_stored = calc_result["total_completed"]
        app_record.total_retainage = calc_result["total_retainage"]
        app_record.net_payment_due = calc_result["total_current_payment_due"]
        app_record.status = status

        db.flush()

        for line in calc_result["lines"]:
            line_item = SOVLineItem(
                id=uuid.uuid4(),
                application_id=app_record.id,
                line_item_code=line["line_item_id"],
                description=line["description"],
                scheduled_value=line["scheduled_value"],
                work_previous=line["work_previous"],
                work_current=line["work_current"],
                stored_materials=line["stored_materials"],
                total_completed_stored=line["total_completed_stored"],
                retainage_amount=line["retainage_amount"],
                current_due=line["current_payment_due"],
                balance_to_finish=line["balance_to_finish"]
            )
            db.add(line_item)

        db.commit()
        db.refresh(app_record)
        return app_record

    @classmethod
    def list_sov_applications(cls, db: Session, tenant_id: uuid.UUID, project_id: Optional[uuid.UUID] = None) -> List[SOVApplication]:
        query = db.query(SOVApplication).filter(SOVApplication.tenant_id == tenant_id)
        if project_id:
            query = query.filter(SOVApplication.project_id == project_id)
        return query.order_by(SOVApplication.application_number.asc()).all()

    @classmethod
    def create_change_event(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        title: str,
        trade_scope: str,
        estimated_cost: float,
        project_id: Optional[uuid.UUID] = None,
        actor_id: Optional[uuid.UUID] = None,
        status: str = "draft"
    ) -> ChangeEvent:
        if project_id:
            owned = db.query(Project).filter(Project.id == project_id, Project.tenant_id == tenant_id).first()
            if not owned:
                raise ValueError("Project not found for active tenant.")
        count = db.query(ChangeEvent).filter(ChangeEvent.tenant_id == tenant_id).count()
        event_number = f"CE-{count + 12:03d}"
        
        event = ChangeEvent(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            project_id=project_id,
            event_number=event_number,
            title=title,
            trade_scope=trade_scope,
            estimated_cost=estimated_cost,
            status=status,
            actor_id=actor_id
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def transition_change_event(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        event_id: uuid.UUID,
        new_status: str,
        actor_id: Optional[uuid.UUID] = None
    ) -> ChangeEvent:
        event = db.query(ChangeEvent).filter(
            ChangeEvent.id == event_id,
            ChangeEvent.tenant_id == tenant_id
        ).first()

        if not event:
            raise ValueError("Change event not found.")

        # Valid transitions: draft -> rfq_issued -> pco_submitted -> pco_approved / rejected
        valid_transitions = {
            "draft": ["rfq_issued", "rejected"],
            "rfq_issued": ["pco_submitted", "rejected"],
            "pco_submitted": ["pco_approved", "rejected"],
            "pco_approved": [],  # Terminal state - requires authorized change order workflow
            "rejected": ["draft"]
        }

        allowed = valid_transitions.get(event.status, [])
        if new_status not in allowed and new_status != event.status:
            raise ValueError(f"Invalid status transition from '{event.status}' to '{new_status}'.")

        prev_status = event.status
        event.status = new_status
        event.actor_id = actor_id
        event.updated_at = datetime.utcnow()
        AuditService.record(
            db=db,
            action="construction.change_event.transitioned",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="change_event",
            resource_id=str(event.id),
            details={"from": prev_status, "to": new_status, "event_number": event.event_number},
        )
        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def approve_sov_application(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        application_id: uuid.UUID,
        actor_id: Optional[uuid.UUID] = None,
    ) -> SOVApplication:
        app_record = db.query(SOVApplication).filter(
            SOVApplication.id == application_id,
            SOVApplication.tenant_id == tenant_id,
        ).first()
        if not app_record:
            raise ValueError("SOV application not found for active tenant.")
        app_record.status = "approved"
        AuditService.record(
            db=db,
            action="construction.sov.approved",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="sov_application",
            resource_id=str(app_record.id),
            details={
                "application_number": app_record.application_number,
                "net_payment_due": float(app_record.net_payment_due or 0.0),
            },
        )
        db.commit()
        db.refresh(app_record)
        return app_record

    @classmethod
    def export_sov_for_accounting(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        application_id: uuid.UUID,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        app_record = db.query(SOVApplication).filter(
            SOVApplication.id == application_id,
            SOVApplication.tenant_id == tenant_id,
        ).first()
        if not app_record:
            raise ValueError("SOV application not found for active tenant.")

        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "item_no",
            "description",
            "scheduled_value",
            "work_previous",
            "work_current",
            "stored_materials",
            "total_completed_stored",
            "retainage_amount",
            "current_due",
            "balance_to_finish",
        ])
        for li in app_record.line_items:
            desc = str(li.description or "")
            if desc.startswith(("=", "+", "-", "@")):
                desc = f"'{desc}"
            writer.writerow([
                li.line_item_code,
                desc,
                float(li.scheduled_value or 0),
                float(li.work_previous or 0),
                float(li.work_current or 0),
                float(li.stored_materials or 0),
                float(li.total_completed_stored or 0),
                float(li.retainage_amount or 0),
                float(li.current_due or 0),
                float(li.balance_to_finish or 0),
            ])

        AuditService.record(
            db=db,
            action="construction.sov.exported",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="sov_application",
            resource_id=str(app_record.id),
            details={"application_number": app_record.application_number, "format": "AIA_G702_G703"},
        )
        db.commit()

        return {
            "format": "AIA_G702_G703",
            "application_id": str(app_record.id),
            "application_number": app_record.application_number,
            "status": app_record.status,
            "g702_summary": {
                "original_contract_sum": float(app_record.total_contract_value or 0),
                "total_completed_and_stored": float(app_record.total_completed_stored or 0),
                "retainage_rate_pct": float(app_record.retainage_rate_pct or 0),
                "total_retainage": float(app_record.total_retainage or 0),
                "current_payment_due": float(app_record.net_payment_due or 0),
            },
            "csv_content": buf.getvalue(),
        }

    @classmethod
    def list_change_events(cls, db: Session, tenant_id: uuid.UUID) -> List[ChangeEvent]:
        return db.query(ChangeEvent).filter(ChangeEvent.tenant_id == tenant_id).order_by(ChangeEvent.created_at.desc()).all()

    @classmethod
    def record_field_tm(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        trade: str,
        worker_name: str,
        hours_worked: float,
        materials_cost: float = 0.0,
        equipment_cost: float = 0.0,
        project_id: Optional[uuid.UUID] = None,
        change_event_id: Optional[uuid.UUID] = None,
        supervisor_approved: bool = False
    ) -> FieldTimeMaterial:
        record = FieldTimeMaterial(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            project_id=project_id,
            change_event_id=change_event_id,
            trade=trade,
            worker_name=worker_name,
            hours_worked=hours_worked,
            materials_cost=materials_cost,
            equipment_cost=equipment_cost,
            supervisor_approved=supervisor_approved
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    # --- Construction CRM Bid Desk: RFQs, Estimates, Bid/No-Bid, Award & Handover ---

    @classmethod
    def list_rfqs(cls, db: Session, tenant_id: uuid.UUID) -> List[Dict[str, Any]]:
        rows = (
            db.query(RFQ)
            .filter(RFQ.tenant_id == tenant_id)
            .order_by(RFQ.created_at.desc())
            .all()
        )
        accounts = {
            a.id: a.name
            for a in db.query(Account).filter(Account.tenant_id == tenant_id).all()
        }
        estimates_by_rfq: Dict[uuid.UUID, List[Estimate]] = {}
        for est in (
            db.query(Estimate)
            .filter(Estimate.tenant_id == tenant_id)
            .order_by(Estimate.created_at.desc())
            .all()
        ):
            if est.rfq_id:
                estimates_by_rfq.setdefault(est.rfq_id, []).append(est)

        now = datetime.utcnow()
        result: List[Dict[str, Any]] = []
        for r in rows:
            ests = estimates_by_rfq.get(r.id, [])
            latest_est = ests[0] if ests else None
            days_until_due = (r.due_date - now).days if r.due_date else None
            result.append(
                {
                    "id": str(r.id),
                    "project_name": r.project_name,
                    "account_id": str(r.account_id) if r.account_id else None,
                    "gc_name": accounts.get(r.account_id, "Direct / Plan Room ITB") if r.account_id else "Direct / Plan Room ITB",
                    "due_date": r.due_date.isoformat() if r.due_date else None,
                    "days_until_due": days_until_due,
                    "status": r.status or "open",
                    "description": r.description or "",
                    "estimate_count": len(ests),
                    "latest_estimate_version": latest_est.version if latest_est else None,
                    "latest_estimate_amount": float(latest_est.total_amount or 0.0) if latest_est else 0.0,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
            )
        return result

    @classmethod
    def create_rfq(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        project_name: str,
        due_date: Optional[datetime] = None,
        account_id: Optional[uuid.UUID] = None,
        status: str = "open",
        description: Optional[str] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> RFQ:
        if account_id is not None:
            owned_acc = (
                db.query(Account)
                .filter(Account.id == account_id, Account.tenant_id == tenant_id)
                .first()
            )
            if not owned_acc:
                raise ValueError("General Contractor account not found for active tenant.")
        rfq = RFQ(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            account_id=account_id,
            project_name=project_name,
            due_date=due_date,
            status=status,
            description=description,
        )
        db.add(rfq)
        AuditService.record(
            db=db,
            action="construction.rfq.created",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="rfq",
            resource_id=str(rfq.id),
            details={"project_name": project_name, "status": status},
        )
        db.commit()
        db.refresh(rfq)
        return rfq

    @classmethod
    def update_rfq(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        rfq_id: uuid.UUID,
        status: Optional[str] = None,
        due_date: Optional[datetime] = None,
        description: Optional[str] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Optional[RFQ]:
        rfq = (
            db.query(RFQ)
            .filter(RFQ.id == rfq_id, RFQ.tenant_id == tenant_id)
            .first()
        )
        if not rfq:
            return None
        prev_status = rfq.status
        if status is not None:
            rfq.status = status
        if due_date is not None:
            rfq.due_date = due_date
        if description is not None:
            rfq.description = description
        AuditService.record(
            db=db,
            action="construction.rfq.updated",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="rfq",
            resource_id=str(rfq.id),
            details={"from": prev_status, "to": rfq.status, "project_name": rfq.project_name},
        )
        db.commit()
        db.refresh(rfq)
        return rfq

    @classmethod
    def list_estimates(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        rfq_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        q = db.query(Estimate).filter(Estimate.tenant_id == tenant_id)
        if rfq_id:
            q = q.filter(Estimate.rfq_id == rfq_id)
        rows = q.order_by(Estimate.created_at.desc()).all()
        rfq_names = {
            r.id: r.project_name
            for r in db.query(RFQ).filter(RFQ.tenant_id == tenant_id).all()
        }
        return [
            {
                "id": str(e.id),
                "rfq_id": str(e.rfq_id) if e.rfq_id else None,
                "project_name": rfq_names.get(e.rfq_id, "Direct Trade Estimate") if e.rfq_id else "Direct Trade Estimate",
                "version": e.version or "1.0",
                "total_amount": float(e.total_amount or 0.0),
                "status": e.status or "draft",
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in rows
        ]

    @classmethod
    def create_estimate(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        rfq_id: Optional[uuid.UUID],
        total_amount: float,
        version: Optional[str] = None,
        status: str = "draft",
        actor_id: Optional[uuid.UUID] = None,
    ) -> Estimate:
        if rfq_id is not None:
            owned_rfq = (
                db.query(RFQ)
                .filter(RFQ.id == rfq_id, RFQ.tenant_id == tenant_id)
                .first()
            )
            if not owned_rfq:
                raise ValueError("RFQ not found for active tenant.")
            existing_count = (
                db.query(Estimate)
                .filter(Estimate.tenant_id == tenant_id, Estimate.rfq_id == rfq_id)
                .count()
            )
            computed_version = version or f"{existing_count + 1}.0"
            if status == "submitted":
                owned_rfq.status = "submitted"
            elif owned_rfq.status == "open":
                owned_rfq.status = "estimating"
        else:
            computed_version = version or "1.0"

        est = Estimate(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            rfq_id=rfq_id,
            version=computed_version,
            total_amount=total_amount,
            status=status,
        )
        db.add(est)
        AuditService.record(
            db=db,
            action="construction.estimate.created",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="estimate",
            resource_id=str(est.id),
            details={"version": computed_version, "total_amount": float(total_amount), "status": status},
        )
        db.commit()
        db.refresh(est)
        return est

    @classmethod
    def award_and_handover_rfq(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        rfq_id: uuid.UUID,
        awarded_amount: Optional[float] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        rfq = (
            db.query(RFQ)
            .filter(RFQ.id == rfq_id, RFQ.tenant_id == tenant_id)
            .first()
        )
        if not rfq:
            raise ValueError("RFQ not found for active tenant.")

        latest_est = (
            db.query(Estimate)
            .filter(Estimate.tenant_id == tenant_id, Estimate.rfq_id == rfq.id)
            .order_by(Estimate.created_at.desc())
            .first()
        )
        estimated_val = float(latest_est.total_amount or 0.0) if latest_est else 0.0
        final_budget = float(awarded_amount) if awarded_amount and awarded_amount > 0 else (estimated_val or 250000.0)

        rfq.status = "awarded"
        if latest_est:
            latest_est.status = "awarded"

        # Create active Construction Project handover record
        project = Project(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            project_name=rfq.project_name,
            start_date=datetime.utcnow(),
            status="active",
            budget=final_budget,
        )
        db.add(project)
        db.flush()

        # Sync matching Opportunity to 'won' if one exists, otherwise create awarded backlog Opportunity
        matching_opp = (
            db.query(Opportunity)
            .filter(Opportunity.tenant_id == tenant_id, Opportunity.name == rfq.project_name)
            .first()
        )
        if matching_opp:
            matching_opp.stage = "won"
            matching_opp.probability = "100"
            matching_opp.amount = final_budget
            matching_opp.updated_at = datetime.utcnow()
        else:
            matching_opp = Opportunity(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                account_id=rfq.account_id,
                name=rfq.project_name,
                amount=final_budget,
                stage="won",
                probability="100",
                close_date=datetime.utcnow(),
                owner_id=actor_id,
            )
            db.add(matching_opp)
            db.flush()

        AuditService.record(
            db=db,
            action="construction.rfq.awarded_handover",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="project",
            resource_id=str(project.id),
            details={
                "rfq_id": str(rfq.id),
                "project_name": project.project_name,
                "estimated_value": estimated_val,
                "awarded_value": final_budget,
                "opportunity_id": str(matching_opp.id),
            },
        )
        # Schedule post-award customer follow-up & SOV setup activity
        AuditService.record(
            db=db,
            action="crm.activity",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="opportunity",
            resource_id=str(matching_opp.id),
            details={
                "activity_type": "followup",
                "subject": f"Post-Award GC Handover & Submittal Schedule: {project.project_name}",
                "due_date": datetime.utcnow().isoformat(),
                "completed": False,
                "notes": f"Contract awarded at ${final_budget:,.0f}. Initialize AIA G702/G703 SOV and confirm GC kickoff.",
                "auto_generated": True,
            },
        )
        db.commit()
        return {
            "rfq_id": str(rfq.id),
            "project_id": str(project.id),
            "opportunity_id": str(matching_opp.id),
            "project_name": project.project_name,
            "estimated_value": estimated_val,
            "awarded_value": final_budget,
            "status": "awarded",
        }

    @classmethod
    def get_bid_analytics(cls, db: Session, tenant_id: uuid.UUID) -> Dict[str, Any]:
        rfqs = db.query(RFQ).filter(RFQ.tenant_id == tenant_id).all()
        estimates = db.query(Estimate).filter(Estimate.tenant_id == tenant_id).all()
        projects = db.query(Project).filter(Project.tenant_id == tenant_id).all()
        sov_apps = db.query(SOVApplication).filter(SOVApplication.tenant_id == tenant_id).all()
        change_events = db.query(ChangeEvent).filter(ChangeEvent.tenant_id == tenant_id).all()

        now = datetime.utcnow()
        due_soon = sum(
            1
            for r in rfqs
            if r.due_date
            and (r.status or "open") in ("open", "estimating", "bid_go")
            and 0 <= (r.due_date - now).days <= 7
        )
        awarded_rfqs = sum(1 for r in rfqs if r.status == "awarded")
        lost_rfqs = sum(1 for r in rfqs if r.status == "lost")
        no_bid_rfqs = sum(1 for r in rfqs if r.status == "no_bid")
        submitted_rfqs = sum(1 for r in rfqs if r.status in ("submitted", "awarded", "lost"))

        decided = awarded_rfqs + lost_rfqs
        bid_hit_ratio = round((awarded_rfqs / decided) * 100.0, 1) if decided > 0 else (
            round((awarded_rfqs / submitted_rfqs) * 100.0, 1) if submitted_rfqs > 0 else 0.0
        )

        total_estimated = sum(float(e.total_amount or 0.0) for e in estimates)
        total_awarded = sum(float(p.budget or 0.0) for p in projects)
        sov_net_total = sum(float(a.net_payment_due or 0.0) for a in sov_apps)

        return {
            "has_bid_records": bool(rfqs or estimates),
            "rfqs_total": len(rfqs),
            "rfqs_open": sum(1 for r in rfqs if (r.status or "open") in ("open", "estimating", "bid_go")),
            "rfqs_due_soon": due_soon,
            "no_bid_count": no_bid_rfqs,
            "bids_submitted_count": submitted_rfqs,
            "bids_awarded_count": awarded_rfqs,
            "bids_lost_count": lost_rfqs,
            "bid_hit_ratio_pct": bid_hit_ratio,
            "total_estimated_value": round(total_estimated, 2),
            "total_awarded_contract_value": round(total_awarded, 2),
            "active_projects_count": len(projects),
            "sov_applications_count": len(sov_apps),
            "sov_net_certified_value": round(sov_net_total, 2),
            "change_events_count": len(change_events),
        }

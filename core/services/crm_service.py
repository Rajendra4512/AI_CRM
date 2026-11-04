import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from core.models.crm import Account, Contact, Lead, Opportunity
from core.models.admin import AuditLog, SystemConfig
from core.services.audit_service import AuditService


DEFAULT_CONSTRUCTION_STAGES: List[Dict[str, Any]] = [
    {"key": "lead", "label": "Inbound Leads / ITBs", "probability": 15},
    {"key": "qualified", "label": "Qualified", "probability": 30},
    {"key": "rfq_takeoff", "label": "RFQ & Takeoff", "probability": 50},
    {"key": "proposal", "label": "Bid Submitted", "probability": 65},
    {"key": "negotiation", "label": "GC Negotiation", "probability": 80},
    {"key": "won", "label": "Contract Awarded", "probability": 100},
    {"key": "lost", "label": "Lost / No-Bid", "probability": 0},
]

DEFAULT_GENERIC_STAGES: List[Dict[str, Any]] = [
    {"key": "lead", "label": "Inbound Leads", "probability": 20},
    {"key": "qualified", "label": "Qualified", "probability": 45},
    {"key": "proposal", "label": "Proposal / Bid", "probability": 70},
    {"key": "won", "label": "Closed Won", "probability": 100},
    {"key": "lost", "label": "Closed Lost", "probability": 0},
]


class CRMService:

    @staticmethod
    def list_accounts(db: Session, tenant_id: uuid.UUID) -> List[Account]:
        return (
            db.query(Account)
            .filter(Account.tenant_id == tenant_id)
            .order_by(Account.created_at.desc())
            .all()
        )

    @staticmethod
    def create_account(
        db: Session,
        tenant_id: uuid.UUID,
        name: str,
        account_type: Optional[str] = "Customer",
        industry: Optional[str] = None,
        website: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        owner_id: Optional[uuid.UUID] = None,
    ) -> Account:
        account = Account(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name=name,
            account_type=account_type,
            industry=industry,
            website=website,
            phone=phone,
            email=email,
            owner_id=owner_id,
        )
        db.add(account)
        AuditService.record(
            db=db,
            action="crm.account.created",
            tenant_id=tenant_id,
            user_id=owner_id,
            resource_type="account",
            resource_id=str(account.id),
            details={"name": name, "account_type": account_type},
        )
        db.commit()
        db.refresh(account)
        return account

    @staticmethod
    def update_account(
        db: Session,
        tenant_id: uuid.UUID,
        account_id: uuid.UUID,
        name: Optional[str] = None,
        account_type: Optional[str] = None,
        industry: Optional[str] = None,
        website: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Optional[Account]:
        account = (
            db.query(Account)
            .filter(Account.id == account_id, Account.tenant_id == tenant_id)
            .first()
        )
        if not account:
            return None
        if name is not None:
            account.name = name
        if account_type is not None:
            account.account_type = account_type
        if industry is not None:
            account.industry = industry
        if website is not None:
            account.website = website
        if phone is not None:
            account.phone = phone
        if email is not None:
            account.email = email
        account.updated_at = datetime.utcnow()
        AuditService.record(
            db=db,
            action="crm.account.updated",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="account",
            resource_id=str(account.id),
            details={"name": account.name, "account_type": account.account_type},
        )
        db.commit()
        db.refresh(account)
        return account

    @staticmethod
    def list_contacts(db: Session, tenant_id: uuid.UUID) -> List[Contact]:
        return (
            db.query(Contact)
            .filter(Contact.tenant_id == tenant_id)
            .order_by(Contact.created_at.desc())
            .all()
        )

    @staticmethod
    def create_contact(
        db: Session,
        tenant_id: uuid.UUID,
        first_name: str,
        last_name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        title: Optional[str] = None,
        account_id: Optional[uuid.UUID] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Contact:
        if account_id is not None:
            owned_account = (
                db.query(Account)
                .filter(Account.id == account_id, Account.tenant_id == tenant_id)
                .first()
            )
            if not owned_account:
                raise ValueError("Account not found for active tenant")

        contact = Contact(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            account_id=account_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            title=title,
        )
        db.add(contact)
        AuditService.record(
            db=db,
            action="crm.contact.created",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="contact",
            resource_id=str(contact.id),
            details={"name": f"{first_name} {last_name}", "title": title},
        )
        db.commit()
        db.refresh(contact)
        return contact

    @staticmethod
    def list_leads(db: Session, tenant_id: uuid.UUID) -> List[Lead]:
        return (
            db.query(Lead)
            .filter(Lead.tenant_id == tenant_id)
            .order_by(Lead.created_at.desc())
            .all()
        )

    @staticmethod
    def create_lead(
        db: Session,
        tenant_id: uuid.UUID,
        first_name: str,
        last_name: str,
        company: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        status: str = "new",
        source: Optional[str] = "Web",
        owner_id: Optional[uuid.UUID] = None,
    ) -> Lead:
        lead = Lead(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            first_name=first_name,
            last_name=last_name,
            company=company,
            email=email,
            phone=phone,
            status=status,
            source=source,
            owner_id=owner_id,
        )
        db.add(lead)
        AuditService.record(
            db=db,
            action="crm.lead.created",
            tenant_id=tenant_id,
            user_id=owner_id,
            resource_type="lead",
            resource_id=str(lead.id),
            details={"company": company, "source": source, "status": status},
        )
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead(
        db: Session,
        tenant_id: uuid.UUID,
        lead_id: uuid.UUID,
        status: Optional[str] = None,
        source: Optional[str] = None,
        company: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Optional[Lead]:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id, Lead.tenant_id == tenant_id)
            .first()
        )
        if not lead:
            return None
        if status is not None:
            lead.status = status
        if source is not None:
            lead.source = source
        if company is not None:
            lead.company = company
        if email is not None:
            lead.email = email
        if phone is not None:
            lead.phone = phone
        lead.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def qualify_lead(
        db: Session,
        tenant_id: uuid.UUID,
        lead_id: uuid.UUID,
        actor_id: Optional[uuid.UUID] = None,
        account_type: str = "General Contractor",
        contact_title: str = "Preconstruction / Estimator",
        opportunity_name: Optional[str] = None,
        estimated_amount: float = 175000.0,
        initial_stage: str = "qualified",
        create_rfq: bool = False,
        due_days: int = 14,
        scope_notes: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id, Lead.tenant_id == tenant_id)
            .first()
        )
        if not lead:
            return None

        company_name = (lead.company or f"{lead.first_name} {lead.last_name} Contracting").strip()
        account = (
            db.query(Account)
            .filter(Account.tenant_id == tenant_id, Account.name == company_name)
            .first()
        )
        if not account:
            account = Account(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                name=company_name,
                account_type=account_type,
                industry="Construction",
                phone=lead.phone,
                email=lead.email,
                owner_id=actor_id,
            )
            db.add(account)
            db.flush()

        contact = Contact(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            account_id=account.id,
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            title=contact_title,
        )
        db.add(contact)
        db.flush()

        due_date = datetime.utcnow() + timedelta(days=max(1, due_days))
        deal_title = (opportunity_name or f"{company_name} — Trade Bid Package").strip()
        opp = Opportunity(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            account_id=account.id,
            name=deal_title,
            amount=estimated_amount,
            stage=initial_stage,
            probability="30",
            close_date=due_date,
            owner_id=actor_id,
        )
        db.add(opp)
        db.flush()

        created_rfq_id: Optional[str] = None
        if create_rfq:
            from modules.construction.models import RFQ

            rfq = RFQ(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                account_id=account.id,
                project_name=deal_title,
                due_date=due_date,
                status="open",
                description=scope_notes or f"Qualified from lead {lead.first_name} {lead.last_name} ({lead.source or 'Inbound ITB'})",
            )
            db.add(rfq)
            db.flush()
            created_rfq_id = str(rfq.id)

        lead.status = "qualified"
        lead.updated_at = datetime.utcnow()

        AuditService.record(
            db=db,
            action="crm.lead.qualified",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="opportunity",
            resource_id=str(opp.id),
            details={
                "lead_id": str(lead.id),
                "account_id": str(account.id),
                "contact_id": str(contact.id),
                "rfq_id": created_rfq_id,
                "company": company_name,
                "amount": float(estimated_amount),
            },
        )
        # Schedule initial qualification follow-up task
        AuditService.record(
            db=db,
            action="crm.activity",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="opportunity",
            resource_id=str(opp.id),
            details={
                "activity_type": "call",
                "subject": f"Confirm ITB drawings & bid due date with {lead.first_name} {lead.last_name}",
                "due_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
                "completed": False,
                "notes": scope_notes or "Auto-scheduled upon lead qualification.",
                "auto_generated": True,
            },
        )

        db.commit()
        return {
            "lead_id": str(lead.id),
            "account_id": str(account.id),
            "contact_id": str(contact.id),
            "opportunity_id": str(opp.id),
            "rfq_id": created_rfq_id,
            "opportunity_name": opp.name,
            "account_name": account.name,
        }

    @staticmethod
    def delete_lead(db: Session, tenant_id: uuid.UUID, lead_id: uuid.UUID) -> bool:
        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id, Lead.tenant_id == tenant_id)
            .first()
        )
        if not lead:
            return False
        db.delete(lead)
        db.commit()
        return True

    @staticmethod
    def list_opportunities(db: Session, tenant_id: uuid.UUID) -> List[Opportunity]:
        return (
            db.query(Opportunity)
            .filter(Opportunity.tenant_id == tenant_id)
            .order_by(Opportunity.updated_at.desc())
            .all()
        )

    @staticmethod
    def create_opportunity(
        db: Session,
        tenant_id: uuid.UUID,
        name: str,
        amount: Optional[float] = 0.0,
        stage: str = "prospecting",
        account_id: Optional[uuid.UUID] = None,
        probability: Optional[str] = None,
        close_date: Optional[datetime] = None,
        owner_id: Optional[uuid.UUID] = None,
    ) -> Opportunity:
        if account_id is not None:
            owned_account = (
                db.query(Account)
                .filter(Account.id == account_id, Account.tenant_id == tenant_id)
                .first()
            )
            if not owned_account:
                raise ValueError("Account not found for active tenant")
        opp = Opportunity(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name=name,
            amount=amount,
            stage=stage,
            account_id=account_id,
            probability=probability or "25",
            close_date=close_date or (datetime.utcnow() + timedelta(days=21)),
            owner_id=owner_id,
        )
        db.add(opp)
        AuditService.record(
            db=db,
            action="crm.opportunity.created",
            tenant_id=tenant_id,
            user_id=owner_id,
            resource_type="opportunity",
            resource_id=str(opp.id),
            details={"name": name, "amount": float(amount or 0), "stage": stage},
        )
        db.commit()
        db.refresh(opp)
        return opp

    @classmethod
    def _trigger_stage_automation(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        opp: Opportunity,
        prev_stage: str,
        new_stage: str,
        actor_id: Optional[uuid.UUID] = None,
    ) -> None:
        if prev_stage == new_stage:
            return
        AuditService.record(
            db=db,
            action="crm.opportunity.stage_changed",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="opportunity",
            resource_id=str(opp.id),
            details={"from": prev_stage, "to": new_stage, "name": opp.name},
        )
        if new_stage in ("proposal", "bid_submitted"):
            AuditService.record(
                db=db,
                action="crm.activity",
                tenant_id=tenant_id,
                user_id=actor_id,
                resource_type="opportunity",
                resource_id=str(opp.id),
                details={
                    "activity_type": "followup",
                    "subject": f"GC Post-Bid Follow-Up: {opp.name}",
                    "due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
                    "completed": False,
                    "notes": "Automated reminder: confirm receipt of scope proposal & exclusions with GC estimator.",
                    "auto_generated": True,
                },
            )
        elif new_stage in ("won", "closed_won", "awarded"):
            AuditService.record(
                db=db,
                action="crm.activity",
                tenant_id=tenant_id,
                user_id=actor_id,
                resource_type="opportunity",
                resource_id=str(opp.id),
                details={
                    "activity_type": "meeting",
                    "subject": f"Project Handover & SOV Setup: {opp.name}",
                    "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                    "completed": False,
                    "notes": "Automated reminder: hand over awarded estimate to Project Management & initialize AIA G702/G703 SOV.",
                    "auto_generated": True,
                },
            )

    @classmethod
    def update_opportunity_stage(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        opportunity_id: uuid.UUID,
        stage: str,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Optional[Opportunity]:
        opp = (
            db.query(Opportunity)
            .filter(
                Opportunity.id == opportunity_id,
                Opportunity.tenant_id == tenant_id,
            )
            .first()
        )
        if opp:
            prev = opp.stage or "lead"
            opp.stage = stage
            stage_prob = {
                "lead": "15",
                "prospecting": "15",
                "qualified": "30",
                "rfq_takeoff": "50",
                "proposal": "65",
                "negotiation": "80",
                "won": "100",
                "closed_won": "100",
                "lost": "0",
            }
            if stage in stage_prob:
                opp.probability = stage_prob[stage]
            opp.updated_at = datetime.utcnow()
            cls._trigger_stage_automation(db, tenant_id, opp, prev, stage, actor_id)
            db.commit()
            db.refresh(opp)
        return opp

    @classmethod
    def update_opportunity(
        cls,
        db: Session,
        tenant_id: uuid.UUID,
        opportunity_id: uuid.UUID,
        name: Optional[str] = None,
        amount: Optional[float] = None,
        stage: Optional[str] = None,
        probability: Optional[str] = None,
        close_date: Optional[datetime] = None,
        account_id: Optional[uuid.UUID] = None,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Optional[Opportunity]:
        opp = (
            db.query(Opportunity)
            .filter(Opportunity.id == opportunity_id, Opportunity.tenant_id == tenant_id)
            .first()
        )
        if not opp:
            return None
        if account_id is not None:
            owned_account = (
                db.query(Account)
                .filter(Account.id == account_id, Account.tenant_id == tenant_id)
                .first()
            )
            if not owned_account:
                raise ValueError("Account not found for active tenant")
            opp.account_id = account_id
        if name is not None:
            opp.name = name
        if amount is not None:
            opp.amount = amount
        if probability is not None:
            opp.probability = probability
        if close_date is not None:
            opp.close_date = close_date
        if stage is not None and stage != opp.stage:
            prev = opp.stage or "lead"
            opp.stage = stage
            cls._trigger_stage_automation(db, tenant_id, opp, prev, stage, actor_id)
        opp.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(opp)
        return opp

    @staticmethod
    def get_pipeline_stages(db: Session, tenant_id: uuid.UUID, industry: str = "construction") -> List[Dict[str, Any]]:
        cfg_key = f"pipeline_stages:{tenant_id}"
        rec = db.query(SystemConfig).filter(SystemConfig.key == cfg_key).first()
        if rec and rec.value:
            try:
                parsed = json.loads(rec.value)
                if isinstance(parsed, list) and len(parsed) >= 2:
                    return parsed
            except (ValueError, TypeError):
                pass
        if "construction" in (industry or "").lower():
            return DEFAULT_CONSTRUCTION_STAGES
        return DEFAULT_GENERIC_STAGES

    @staticmethod
    def save_pipeline_stages(
        db: Session,
        tenant_id: uuid.UUID,
        stages: List[Dict[str, Any]],
        actor_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        cfg_key = f"pipeline_stages:{tenant_id}"
        rec = db.query(SystemConfig).filter(SystemConfig.key == cfg_key).first()
        serialized = json.dumps(stages)
        if rec:
            rec.value = serialized
            rec.updated_at = datetime.utcnow()
        else:
            rec = SystemConfig(
                id=uuid.uuid4(),
                key=cfg_key,
                value=serialized,
                category="crm_pipeline",
                encrypted=False,
            )
            db.add(rec)
        AuditService.record(
            db=db,
            action="crm.pipeline_config.updated",
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type="pipeline_config",
            resource_id=str(tenant_id),
            details={"stage_count": len(stages)},
        )
        db.commit()
        return stages

    @staticmethod
    def create_activity(
        db: Session,
        tenant_id: uuid.UUID,
        activity_type: str,
        subject: str,
        resource_type: str = "opportunity",
        resource_id: Optional[str] = None,
        due_date: Optional[str] = None,
        notes: Optional[str] = None,
        completed: bool = False,
        actor_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        action_name = (
            "crm.note"
            if activity_type == "note"
            else "crm.email"
            if activity_type == "email"
            else "crm.activity"
        )
        entry = AuditService.record(
            db=db,
            action=action_name,
            tenant_id=tenant_id,
            user_id=actor_id,
            resource_type=resource_type,
            resource_id=resource_id,
            details={
                "activity_type": activity_type,
                "subject": subject,
                "due_date": due_date or (datetime.utcnow() + timedelta(days=2)).isoformat(),
                "notes": notes or "",
                "completed": True if activity_type in ("note", "email") else bool(completed),
                "auto_generated": False,
            },
            commit=True,
        )
        return CRMService._serialize_activity(entry)

    @staticmethod
    def complete_activity(
        db: Session,
        tenant_id: uuid.UUID,
        activity_id: uuid.UUID,
        completed: bool = True,
    ) -> Optional[Dict[str, Any]]:
        entry = (
            db.query(AuditLog)
            .filter(
                AuditLog.id == activity_id,
                AuditLog.tenant_id == tenant_id,
                AuditLog.action.in_(["crm.activity", "crm.note", "crm.email"]),
            )
            .first()
        )
        if not entry:
            return None
        updated_details = dict(entry.details or {})
        updated_details["completed"] = completed
        updated_details["completed_at"] = datetime.utcnow().isoformat() if completed else None
        entry.details = updated_details
        flag_modified(entry, "details")
        db.commit()
        db.refresh(entry)
        return CRMService._serialize_activity(entry)

    @staticmethod
    def list_activities(
        db: Session,
        tenant_id: uuid.UUID,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        limit: int = 60,
    ) -> List[Dict[str, Any]]:
        q = db.query(AuditLog).filter(
            AuditLog.tenant_id == tenant_id,
            AuditLog.action.in_(
                [
                    "crm.activity",
                    "crm.note",
                    "crm.email",
                    "crm.opportunity.stage_changed",
                    "crm.lead.qualified",
                    "construction.rfq.awarded_handover",
                ]
            ),
        )
        if resource_type:
            q = q.filter(AuditLog.resource_type == resource_type)
        if resource_id:
            q = q.filter(AuditLog.resource_id == str(resource_id))
        rows = q.order_by(AuditLog.created_at.desc()).limit(limit).all()
        return [CRMService._serialize_activity(r) for r in rows]

    @staticmethod
    def _serialize_activity(entry: AuditLog) -> Dict[str, Any]:
        details = entry.details or {}
        act_type = details.get("activity_type") or (
            "stage_change"
            if entry.action == "crm.opportunity.stage_changed"
            else "qualification"
            if entry.action == "crm.lead.qualified"
            else "handover"
            if entry.action == "construction.rfq.awarded_handover"
            else "task"
        )
        subj = details.get("subject")
        if not subj:
            if entry.action == "crm.opportunity.stage_changed":
                subj = f"Pipeline stage moved: {details.get('from', 'lead')} → {details.get('to', '')}"
            elif entry.action == "crm.lead.qualified":
                subj = f"Lead qualified into {details.get('company', 'Account')} (${NumberSafe(details.get('amount')):,})"
            elif entry.action == "construction.rfq.awarded_handover":
                subj = f"Bid awarded & handed over to active project: {details.get('project_name', '')}"
            else:
                subj = entry.action
        return {
            "id": str(entry.id),
            "action": entry.action,
            "activity_type": act_type,
            "subject": subj,
            "notes": details.get("notes", ""),
            "due_date": details.get("due_date"),
            "completed": bool(details.get("completed", entry.action != "crm.activity")),
            "auto_generated": bool(details.get("auto_generated", False)),
            "resource_type": entry.resource_type,
            "resource_id": entry.resource_id,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
        }

    @classmethod
    def get_crm_analytics(cls, db: Session, tenant_id: uuid.UUID, industry: str = "construction") -> Dict[str, Any]:
        leads = cls.list_leads(db, tenant_id)
        accounts = cls.list_accounts(db, tenant_id)
        contacts = cls.list_contacts(db, tenant_id)
        opps = cls.list_opportunities(db, tenant_id)
        stages = cls.get_pipeline_stages(db, tenant_id, industry)
        prob_lookup = {s["key"]: float(s.get("probability", 30)) for s in stages}

        now = datetime.utcnow()
        open_value = 0.0
        weighted_value = 0.0
        won_value = 0.0
        lost_value = 0.0
        won_count = 0
        lost_count = 0
        stale_count = 0
        stage_totals: Dict[str, Dict[str, Any]] = {
            s["key"]: {"key": s["key"], "label": s["label"], "count": 0, "value": 0.0}
            for s in stages
        }

        for o in opps:
            amt = float(o.amount or 0.0)
            st = (o.stage or "lead").lower()
            norm_st = "lead" if st == "prospecting" else "won" if st == "closed_won" else st
            if norm_st not in stage_totals:
                stage_totals[norm_st] = {"key": norm_st, "label": norm_st.title(), "count": 0, "value": 0.0}
            stage_totals[norm_st]["count"] += 1
            stage_totals[norm_st]["value"] += amt

            if norm_st == "won":
                won_value += amt
                won_count += 1
            elif norm_st == "lost":
                lost_value += amt
                lost_count += 1
            else:
                open_value += amt
                try:
                    p = float(o.probability) if o.probability is not None else prob_lookup.get(norm_st, 30.0)
                except ValueError:
                    p = prob_lookup.get(norm_st, 30.0)
                weighted_value += amt * (p / 100.0)
                ref_dt = o.updated_at or o.created_at or now
                if (now - ref_dt).days >= 7:
                    stale_count += 1

        closed_total = won_count + lost_count
        win_rate = round((won_count / closed_total) * 100.0, 1) if closed_total > 0 else (
            round((won_count / len(opps)) * 100.0, 1) if opps else 0.0
        )

        activities = cls.list_activities(db, tenant_id, limit=100)
        open_tasks = [a for a in activities if a["action"] == "crm.activity" and not a["completed"]]
        overdue_tasks = [
            a
            for a in open_tasks
            if a.get("due_date") and str(a["due_date"])[:10] < now.isoformat()[:10]
        ]

        accounts_by_type: Dict[str, int] = {}
        for acc in accounts:
            t_key = acc.account_type or "Customer"
            accounts_by_type[t_key] = accounts_by_type.get(t_key, 0) + 1

        return {
            "has_tenant_records": bool(leads or accounts or opps),
            "leads_total": len(leads),
            "leads_unqualified": sum(1 for l in leads if (l.status or "new") != "qualified"),
            "leads_qualified": sum(1 for l in leads if l.status == "qualified"),
            "accounts_total": len(accounts),
            "accounts_by_type": accounts_by_type,
            "contacts_total": len(contacts),
            "opportunities_total": len(opps),
            "open_opportunities_count": max(0, len(opps) - closed_total),
            "open_pipeline_value": round(open_value, 2),
            "weighted_forecast_value": round(weighted_value, 2),
            "won_value": round(won_value, 2),
            "lost_value": round(lost_value, 2),
            "won_count": won_count,
            "lost_count": lost_count,
            "win_rate_pct": win_rate,
            "stale_deals_count": stale_count,
            "open_activities_count": len(open_tasks),
            "overdue_activities_count": len(overdue_tasks),
            "stage_breakdown": list(stage_totals.values()),
        }


def NumberSafe(val: Any) -> int:
    try:
        return int(float(val or 0))
    except (ValueError, TypeError):
        return 0

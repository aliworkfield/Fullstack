from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func

from app.api.deps import SessionDep, CurrentUser, require_role
from app.crud import (
    create_campaign,
    delete_campaign,
    get_campaign,
    update_campaign,
)
from app.models import Campaign
from app.schemas import (
    CampaignCreate,
    CampaignPublic,
    CampaignsPublic,
    Message,
)

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


# ----------------------------
# CREATE
# ----------------------------
@router.post(
    "/",
    response_model=CampaignPublic,
    dependencies=[require_role(["admin", "manager"])],
)
def create_campaign_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    campaign_in: CampaignCreate,
) -> Campaign:
    return create_campaign(session=session, campaign_in=campaign_in)


# ----------------------------
# READ MANY
# ----------------------------
@router.get(
    "/",
    response_model=CampaignsPublic,
    dependencies=[require_role(["admin", "manager"])],
)
def read_campaigns(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> CampaignsPublic:
    campaigns = session.exec(
        select(Campaign)
        .offset(skip)
        .limit(limit)
    ).all()

    total_count = session.exec(
        select(func.count(Campaign.id))
    ).one()

    return CampaignsPublic(data=campaigns, count=total_count)


# ----------------------------
# READ ONE
# ----------------------------
@router.get(
    "/{id}",
    response_model=CampaignPublic,
    dependencies=[require_role(["admin", "manager"])],
)
def read_campaign(
    *,
    session: SessionDep,
    id: str,
) -> Campaign:
    campaign = get_campaign(session=session, campaign_id=id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


# ----------------------------
# UPDATE
# ----------------------------
@router.put(
    "/{id}",
    response_model=CampaignPublic,
    dependencies=[require_role(["admin", "manager"])],
)
def update_campaign_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    campaign_in: CampaignCreate,
) -> Campaign:
    campaign = get_campaign(session=session, campaign_id=id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return update_campaign(
        session=session,
        campaign=campaign,
        campaign_in=campaign_in,
    )


# ----------------------------
# DELETE
# ----------------------------
@router.delete(
    "/{id}",
    dependencies=[require_role(["admin"])],
)
def delete_campaign_endpoint(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
) -> Message:
    campaign = get_campaign(session=session, campaign_id=id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    delete_campaign(session=session, campaign=campaign)
    return Message(message="Campaign deleted successfully")

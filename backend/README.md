# Coupon Management System - Backend

## Project Structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── campaign.py
│   │   ├── coupon.py
│   │   ├── announcement.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── campaign.py
│   │   ├── coupon.py
│   │   ├── announcement.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── coupon_service.py
│   │   ├── campaign_service.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin/
│   │   │   ├── __init__.py
│   │   │   ├── campaigns.py
│   │   │   ├── coupons.py
│   │   │   ├── announcements.py
│   │   ├── user/
│   │   │   ├── __init__.py
│   │   │   ├── coupons.py
│   ├── dependencies/
│   │   ├── __init__.py
│   └── migrations/
│       ├── __init__.py
│       └── versions/
│           └── 202512221600_create_coupon_system.py
```

## Database Models

### User
- `id` (UUID, PK)
- `username` (VARCHAR 50, UNIQUE)
- `email` (VARCHAR 255, UNIQUE)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Campaign
- `id` (UUID, PK)
- `name` (VARCHAR 255)
- `description` (VARCHAR 1000, NULLABLE)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Coupon
- `id` (UUID, PK)
- `campaign_id` (UUID, FK -> campaigns.id, NOT NULL)
- `code` (VARCHAR 50, UNIQUE, INDEXED)
- `discount_type` (VARCHAR 20) - "percentage" or "fixed"
- `discount_value` (FLOAT)
- `assigned_user_id` (UUID, FK -> users.id, NULLABLE)
- `redeemed` (BOOLEAN, DEFAULT FALSE)
- `redeemed_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
- `expires_at` (TIMESTAMP WITH TIME ZONE, NULLABLE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### Announcement
- `id` (UUID, PK)
- `title` (VARCHAR 255)
- `content` (TEXT)
- `requires_coupon` (BOOLEAN, DEFAULT FALSE)
- `campaign_id` (UUID, FK -> campaigns.id, NULLABLE)
- `is_published` (BOOLEAN, DEFAULT FALSE)
- `publish_date` (TIMESTAMP WITH TIME ZONE, NULLABLE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

## Relationships

- Campaign has many Coupons (One-to-Many)
- Coupon belongs to one Campaign (Many-to-One)
- Coupon optionally belongs to one User (Many-to-One)
- Announcement optionally references a Campaign (Many-to-One)

## API Endpoints

### Admin Routes

#### Campaigns
- `GET /admin/campaigns/` - Get all campaigns with coupon statistics
- `GET /admin/campaigns/{campaign_id}` - Get specific campaign with coupon statistics
- `POST /admin/campaigns/` - Create new campaign
- `PUT /admin/campaigns/{campaign_id}` - Update campaign
- `DELETE /admin/campaigns/{campaign_id}` - Delete campaign

#### Coupons
- `POST /admin/coupons/generate/{campaign_id}/{count}` - Generate coupons for campaign
- `POST /admin/coupons/assign/bulk/{campaign_id}` - Bulk assign campaign coupons to all users
- `POST /admin/coupons/assign/{coupon_id}/user/{user_id}` - Assign specific coupon to specific user
- `GET /admin/coupons/unassigned/{campaign_id}` - Get unassigned coupons for a campaign
- `GET /admin/coupons/stats/{campaign_id}` - Get campaign coupon statistics

#### Announcements
- `GET /admin/announcements/` - Get all announcements
- `GET /admin/announcements/{announcement_id}` - Get specific announcement
- `POST /admin/announcements/` - Create new announcement
- `PUT /admin/announcements/{announcement_id}` - Update announcement
- `DELETE /admin/announcements/{announcement_id}` - Delete announcement

### User Routes

#### Coupons
- `GET /user/coupons/my` - Get current user's coupons
- `POST /user/coupons/redeem/{coupon_id}` - Redeem a coupon
- `GET /user/coupons/{coupon_id}` - Get specific coupon

## Business Rules

1. Coupons are GENERATED under a Campaign
2. Each coupon is UNIQUE and ONE-TIME USE
3. Ownership is FIXED:
   - One coupon belongs to exactly one user
   - `assigned_user_id` lives on the coupon table
4. Admin can assign coupons:
   - Bulk assignment (campaign → all users)
   - Individual assignment (one coupon → one user)
5. Coupon is REDEEMED automatically when user accesses it
6. Once redeemed:
   - Coupon cannot be reused
   - Redemption is final and global
7. Admin must be able to see:
   - Total coupons per campaign
   - Assigned coupons count
   - Redeemed coupons count
8. If a user has no coupon for a campaign, nothing is shown

## Service Layer

### CouponService
- `generate_coupons(campaign_id, count)`
- `assign_campaign_to_all_users(campaign_id)`
- `assign_coupon_to_user(coupon_id, user_id)`
- `redeem_coupon(coupon_id, current_user)`
- `get_campaign_coupon_stats(campaign_id)`
- `get_unassigned_coupons(campaign_id)`

### CampaignService
- `get_campaign_with_coupon_counts(campaign_id)`
- `get_all_campaigns_with_coupon_counts()`

## Database Constraints

- Coupon code must be UNIQUE
- A coupon can only be redeemed once
- `assigned_user_id` can only be set ONCE
- Redeemed coupon cannot be reassigned
- Campaign deletion should be RESTRICTED if coupons exist
# Google Play Premium setup

Android Premium uses Google Play one-time products. The web Premium checkout remains on PayOS. Premium duration is granted by the backend as 30 or 365 days, and the Google Play item is consumed after server verification so it can be purchased again after expiry.

## Play Console

1. Create the app with package name `vn.goldentime.customer`.
2. Create two one-time products (not subscriptions):
   - `golden_time_premium_30d` — grants 30 days.
   - `golden_time_premium_365d` — grants 365 days.
3. Set the prices and availability in Play Console. The Android app displays Google Play's localized prices.
4. Keep multi-quantity purchases disabled; the backend intentionally accepts quantity 1 only.
5. Publish an internal testing release and add tester Google accounts. Billing products are only queryable from a Play-installed build signed for the Play listing.

## Backend credentials

1. Link the Play Console app to a Google Cloud project and enable the Google Play Android Developer API.
2. Create a service account, add it as a Play Console user with order and purchase management permissions, and download its JSON key.
3. Set these environment variables on the backend deployment:

| Variable | Value |
| --- | --- |
| `GOOGLE_PLAY_PACKAGE_NAME` | `vn.goldentime.customer` |
| `GOOGLE_PLAY_PREMIUM_MONTHLY_PRODUCT_ID` | `golden_time_premium_30d` |
| `GOOGLE_PLAY_PREMIUM_ANNUAL_PRODUCT_ID` | `golden_time_premium_365d` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | The complete service-account JSON, stored as a secret |

The profile endpoint reports whether the server credentials are configured. Android disables purchase until that is true and the products have loaded from Google Play.

## Purchase behavior

The app attaches a one-way hashed Golden Time user identifier to the Play purchase. The backend verifies the purchase token and account identifier through the Google Play Developer API, grants the entitlement once per unique token, then consumes the one-time product. If consumption is temporarily unavailable, the stored token makes a later verification retry safe.

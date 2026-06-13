# ZaloPay Integration API Documentation
> Exported for AI agent knowledge base. Use dummy/mock data only — không dùng data thật.

---

## 1. Create New Binding for Tokenization

**Source:** https://docs.zalopay.vn/docs/specs/tokenization-bind  
**Track:** Tokenization

### Endpoint
`POST /v2/tokenization/bind`

### Request Body (application/json | application/xml | application/x-www-form-urlencoded)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `app_id` | int64 | ✅ | Unique ID of the application, provided after merchant registration with ZaloPay. |
| `req_date` | int64 | ✅ | Timestamp when order was created (ms). Max drift: ±15 minutes. |
| `app_trans_id` | string | ✅ | Unique transaction ID. Format: `yyMMddxxxxxxxxx`. Max 40 chars. Example: `180208181007242` |
| `identifier` | string | ✅ | User's identifier on merchant system (user ID, phone, email, etc.) |
| `binding_type` | string | ✅ | `WALLET` or `CARD` |
| `binding_mode` | string | ✅ | `BIND` or `BIND_AND_PAY` |
| `device_type` | string | ✅ | `MOBILE` or `DESKTOP` |
| `binding_data` | string | ✅ | JSON string with binding info. Use `"{}"` if empty. Fields: `redirect_url`, `redirect_deep_link`, `callback_url`, `embed_data` |
| `payment_data` | string | ✅ | JSON string with payment info. Use `"{}"` if empty. Fields: `amount` (int64), `description`, `callback_url`, `embed_data` |
| `mac` | string | ✅ | HMAC-SHA256 signature (see below) |

### MAC Calculation
```
hmac_input = app_id + "|" + app_trans_id + "|" + identifier + "|" + binding_mode + "|" + binding_type + "|" + device_type + "|" + binding_data + "|" + payment_data + "|" + req_date
mac = HMAC_SHA256(hmac_input, app_hmac_key)
```

### binding_data Fields

| Sub-field | Type | Description |
|-----------|------|-------------|
| `redirect_url` | URL string | Merchant web page to redirect after binding (Desktop flow) |
| `redirect_deep_link` | URL string | Merchant app deep-link after binding (Mobile flow) |
| `callback_url` | URL string | ZaloPay notifies this URL on binding success |
| `embed_data` | JSON string | Merchant's own data. Use `"{}"` if empty |

### payment_data Fields

| Sub-field | Type | Description |
|-----------|------|-------------|
| `amount` | int64 | Amount to charge |
| `description` | string | Text shown to user on payment confirm screen |
| `callback_url` | URL string | ZaloPay notifies this URL on payment success |
| `embed_data` | JSON string | Merchant's own data. Use `"{}"` if empty |

### Response (200 OK)

| Field | Type | Description |
|-------|------|-------------|
| `return_code` | integer | Status code (see table below) |
| `return_message` | string | Human-readable message |
| `sub_return_code` | integer | Sub-status code |
| `sub_return_message` | string | Sub-status message |
| `binding_token` | string | Token for this binding |
| `binding_url` | string | URL to redirect user for binding flow |
| `reform_url` | string | Reformed URL |

### Return Codes

| Code | Meaning |
|------|---------|
| `1` | SUCCESS |
| `2` | FAIL |
| `3` | PROCESSING |
| `-500` | SYSTEM_ERROR |
| `-429` | LIMIT_REQUEST_REACH |
| `406` | ILLEGAL_STATUS |
| `-405` | ILLEGAL_CLIENT_REQUEST |
| `-403` | ILLEGAL_SIGNATURE_REQUEST |
| `-402` | ILLEGAL_APP_REQUEST |
| `-401` | ILLEGAL_DATA_REQUEST |

---

## 2. Related Endpoints (Tokenization track)

| API | URL |
|-----|-----|
| Query payment tokenization of a binding | https://docs.zalopay.vn/docs/specs/tokenization-query |
| Create new binding for agreement | https://docs.zalopay.vn/docs/specs/agreement-bind |
| Unbind an agreement | https://docs.zalopay.vn/docs/specs/agreement-unbind |
| Query payment token of a binding | https://docs.zalopay.vn/docs/specs/agreement-query |
| Query user balance before paying | https://docs.zalopay.vn/docs/specs/agreement-balance |
| Request for agreement pay | https://docs.zalopay.vn/docs/specs/agreement-pay |
| Query basic user info | https://docs.zalopay.vn/docs/specs/agreement-query-user |
| Hybrid payment | https://docs.zalopay.vn/docs/specs/hybrid-payment |

---

## 3. Security Note
- All requests must be signed with HMAC-SHA256 using the app's hmac key.
- Full security docs: https://docs.zalopay.vn/docs/developer-tools/security/secure-data-transmission
- **For hackathon/testing: Always use dummy/mock data. Never connect to Production.**


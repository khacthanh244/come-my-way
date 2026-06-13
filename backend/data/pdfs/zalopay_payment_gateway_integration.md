# Zalopay Payment Gateway Integration — Knowledge Base

> **Nguồn:** Tài liệu tích hợp chính thức Zalopay Payment Gateway  
> **Mục đích:** Knowledge base cho AI Agent hỗ trợ merchant tích hợp Zalopay  
> **Phiên bản:** Cập nhật từ tài liệu gốc tháng 6/2026

---

## Mục lục

1. [Tổng quan (Overview)](#tổng-quan)
2. [Luồng hoạt động (How It Works)](#luồng-hoạt-động)
3. [Hướng dẫn tích hợp (Integration Guide)](#hướng-dẫn-tích-hợp)
4. [Đặc tả API (APIs Specification)](#đặc-tả-api)
5. [Danh sách API](#danh-sách-api)
6. [Chi tiết từng API](#chi-tiết-từng-api)
7. [Mã lỗi (Error Codes)](#mã-lỗi)

---

## Tổng quan

Tài liệu này cung cấp hướng dẫn để doanh nghiệp (merchant) tích hợp **Zalopay Payment Gateway** thông qua các API do Zalopay cung cấp.

---

## Luồng hoạt động

### Sơ đồ flow (8 bước)

```
Customer (Website/Mobile App)
    │
    ▼ [1] Customer khởi tạo thanh toán qua Zalopay Payment Gateway
    │
Merchant Services
    │ [2] Merchant tạo order qua Zalopay system
    ▼
Zalopay
    │ [3] Zalopay xác thực merchant → trả về payment link (order_url)
    ▼
Merchant Services
    │ [4] Merchant redirect customer đến Zalopay Gateway bằng order_url
    ▼
Zalopay Payment Gateway
    │ [5] Hiển thị chi tiết đơn hàng, yêu cầu customer thanh toán
    │ [6] Customer chọn phương thức thanh toán và hoàn tất giao dịch
    │ [7] Xử lý thanh toán, trả kết quả, redirect về trang merchant
    ▼
Customer
    [8] Merchant nhận kết quả thanh toán và hiển thị thông báo cho customer
```

### Giải thích từng bước

| Bước | Mô tả |
|------|-------|
| 1 | Customer khởi tạo thanh toán qua Zalopay Payment Gateway |
| 2 | Merchant tạo order qua Zalopay system để customer tiến hành thanh toán |
| 3 | Sau khi xác thực thông tin merchant, Zalopay trả về payment link (`order_url`) |
| 4 | Merchant redirect customer đến Zalopay Payment Gateway bằng `order_url` |
| 5 | Zalopay Payment Gateway hiển thị chi tiết đơn hàng và yêu cầu customer thanh toán |
| 6 | Customer chọn phương thức thanh toán và hoàn tất giao dịch |
| 7 | Zalopay Payment Gateway xử lý thanh toán, trả về kết quả, và redirect về trang merchant |
| 8 | Merchant nhận kết quả thanh toán và hiển thị thông báo trạng thái cho customer |

---

## Hướng dẫn tích hợp

Quy trình tích hợp gồm 4 bước chính:

1. Hiển thị các phương thức thanh toán Zalopay có sẵn
2. Gửi request tạo order lên Zalopay
3. Redirect customer đến Zalopay Payment Gateway
4. Xử lý kết quả thanh toán

### Bước 1: Hiển thị phương thức thanh toán

Khi customer tiến hành thanh toán, giao diện checkout của merchant phải hiển thị các phương thức thanh toán Zalopay, bao gồm:

| Phương thức | Mô tả |
|-------------|-------|
| Zalopay App | Zalopay Gateway hiển thị Zalopay QR multi-function để thanh toán qua Banking và Zalopay/Zalopay trong Zalo app |
| QR Payment via Zalo/Zalopay App | Zalopay Gateway hiển thị Zalopay QR để thanh toán qua Zalopay/Zalopay trong Zalo app |
| Domestic ATM Cards (napas) | Zalopay Gateway hiển thị form nhập thông tin ATM card hoặc Bank account |
| Credit/Debit Cards (VISA, MC, JCB) | Zalopay Gateway hiển thị form nhập thông tin credit card |
| Payment via Zalopay Gateway | Zalopay Gateway hiển thị danh sách tất cả phương thức thanh toán được hỗ trợ |

### Bước 2: Gửi request tạo order

Sau khi customer chọn phương thức thanh toán, merchant gửi request tạo order bằng **Create Order API**.

**Ví dụ Request:**

```json
{
  "app_id": "123020",
  "app_time": "1773889386033",
  "app_trans_id": "260319_123020_1773889382760",
  "app_user": "demo",
  "bank_code": "",
  "amount": "10000",
  "description": "Payment order logistic",
  "embed_data": {
    "preferred_payment_method": []
  },
  "item": [],
  "mac": "2acdb49b5c9848f6f5614e44704d37e06f0902955aca94c1e8954602019fd243"
}
```

**Ví dụ Response:**

```json
{
  "return_code": 1,
  "return_message": "Giao dịch thành công",
  "sub_return_code": 1,
  "sub_return_message": "Giao dịch thành công",
  "zp_trans_token": "ACjEOD8Cb9as2vu_MvW2jndA",
  "order_url": "https://qcgateway.zalopay.vn/openinapp?order=...",
  "order_token": "ACjEOD8Cb9as2vu_MvW2jndA",
  "qr_code": "00020101021226520010vn.zalopay..."
}
```

### Bước 3: Redirect customer đến Zalopay Gateway

Merchant redirect customer đến Zalopay Gateway bằng giá trị `order_url` nhận được trong response sau khi tạo order thành công.

### Bước 4: Xử lý kết quả thanh toán

Sau khi customer hoàn tất thanh toán, Zalopay Gateway sẽ redirect về trang web/app của merchant theo `redirecturl` đã cung cấp khi đăng ký ứng dụng hoặc `redirecturl` chỉ định trong bước tạo order.

### Xử lý Callback từ Zalopay Server (IPN)

Sau khi customer hoàn tất các bước thanh toán trên Zalopay Gateway, nếu thanh toán thành công, Zalopay sẽ gửi thông báo kết quả thanh toán (callback/IPN) về merchant.

### Lấy trạng thái order (Get Order Status)

Callback có thể bị mất do lỗi mạng hoặc dịch vụ không khả dụng. Để đảm bảo trải nghiệm tốt nhất, merchant nên **chủ động query trạng thái order** bằng **Get Order's Status API** với tần suất **1 lần/phút**, cho đến khi nhận được callback hoặc hết thời gian thanh toán của order.

### Navigate (Redirect) về hệ thống Merchant

Sau khi customer hoàn tất thanh toán, Zalopay Gateway sẽ redirect đến trang hiển thị kết quả của Merchant theo `redirecturl` đã cung cấp.

**Dữ liệu được truyền vào query string khi redirect:**

| Parameter | Mô tả |
|-----------|-------|
| `appid` | Thông tin `app_id` của order |
| `apptransid` | Thông tin `app_trans_id` của order |
| `pmcid` | Thông tin payment channel |
| `bankcode` | Thông tin `bank_code` |
| `amount` | Giá trị order |
| `discountamount` | Giá trị discount |
| `status` | Status code |
| `checksum` | Dùng để kiểm tra redirect có hợp lệ không |

**Kiểm tra HMAC hợp lệ:**

```
HMAC(hmac_algorithm, callback_key, appid + "|" + apptransid + "|" + pmcid + "|" + bankcode + "|" + amount + "|" + discountamount + "|" + status)
```

**Ví dụ redirect URL:**

```
https://www.merchant-server.com/result/?amount=10000&discountamount=0&appid=165000&checksum=a179866d...&apptransid=231227_165000_1703670602601&pmcid=38&bankcode=&status=1
```

> **Lưu ý:** Khi nhận redirect hợp lệ, Merchant cần kiểm tra xem đã nhận callback chưa. Nếu chưa, dùng API query trạng thái thanh toán của order để lấy kết quả cuối cùng.

---

## Đặc tả API

### Communication Protocols

| Quy tắc | Chi tiết |
|---------|---------|
| Transmission Method | HTTPS (bắt buộc để đảm bảo bảo mật giao dịch) |
| Submission Method | POST |
| Data Format | `application/json`, `application/x-www-form-urlencoded` |
| Character Encoding | UTF-8 |
| Authentication Algorithm | HMACSHA256 |
| Authentication Requirements | Cả request và data nhận về đều cần xác thực |
| Process Logic | Ưu tiên: protocol field → response code → transaction status |

### Authentication Rules

```
Authentication Algorithm: HmacSHA256
mac = HMAC(hmac_algorithm, key, hmacinput)
```

- `hmac_algorithm`: phương thức bảo mật đăng ký với Zalopay, mặc định là HmacSHA256
- `key`: do Zalopay cung cấp khi đăng ký
- `hmacinput`: quy định riêng cho từng API

### Môi trường (Environments)

| Môi trường | Base URL |
|------------|----------|
| Sandbox | `https://sb-openapi.zalopay.vn` |
| Production | `https://openapi.zalopay.vn` |

---

## Danh sách API

| API | Endpoint | Chiều gọi |
|-----|----------|-----------|
| Create Order | `POST /v2/create` | Merchant → Zalopay |
| Get Order's Status | `POST /v2/query` | Merchant → Zalopay |
| Refund Order | `POST /v2/refund` | Merchant → Zalopay |
| Get Refund Order's Status | `POST /v2/query_refund` | Merchant → Zalopay |
| Payment Notification (IPN) | URL do Merchant cung cấp | Zalopay → Merchant |

### Quy ước Required

| Ký hiệu | Ý nghĩa |
|---------|---------|
| M | Mandatory (bắt buộc) |
| O | Optional (tùy chọn) |

---

## Chi tiết từng API

### API 1: Create Order (`POST /v2/create`)

**Mô tả:** Tạo order mới trên hệ thống Zalopay

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả | Ví dụ |
|-----------|-----------|-----------|----------|-------|-------|
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp khi đăng ký | — |
| `app_user` | String | 50 | M | Thông tin user thực hiện thanh toán (id/username). Không được để trống | `user123` |
| `app_trans_id` | String | 40 | M | Mã giao dịch của order (TXID). Phải bắt đầu bằng `yymmdd` (timezone GMT+7). Format: `yymmddOrderIdentifier` | `240327_12345676` |
| `app_time` | Long | — | M | Thời gian tạo order (unix timestamp tính bằng milliseconds) | `1459823610957` |
| `expire_duration_seconds` | Long | — | O | Thời gian hết hạn order (giây). Min: 300, Max: 2592000 | `900` |
| `amount` | Long | — | M | Giá trị order (VNĐ) | `50000` |
| `description` | String | 256 | M | Mô tả order, hiển thị cho user trên Zalopay app | `Merchant Name - Payment for the order 260323_12345676` |
| `callback_url` | String | — | O | URL của merchant để nhận callback kết quả thanh toán từ Zalopay. Có thể truyền động cho từng order hoặc cấu hình mặc định | — |
| `item` | JSON Array String | 2048 | M | Dữ liệu bổ sung do merchant định nghĩa. Dùng `[]` khi trống | — |
| `embed_data` | JSON String | 2048 | M | Dữ liệu embed của merchant. Dùng `{}` khi trống | — |
| `mac` | String | — | M | Thông tin xác thực (authentication) | — |
| `bank_code` | String | 20 | O | Dùng cho thanh toán online qua Zalopay Gateway. Xem bảng `bank_code` bên dưới | — |

#### Bảng bank_code và preferred_payment_method

| `bank_code` | `preferred_payment_method` | Kết quả hiển thị trên Zalopay Gateway |
|-------------|---------------------------|--------------------------------------|
| `""` | `[]` | Tất cả phương thức và ngân hàng được hỗ trợ (ATM, CC, Zalopay QR, Apple Pay...) |
| `""` | `["domestic_card", "account"]` | Danh sách ngân hàng, user chọn và nhập thông tin ATM card / Bank account |
| `""` | `["zalopay_wallet"]` | Hiển thị Zalopay QR để thanh toán qua Zalopay/Zalopay trong Zalo |
| `""` | `["vietqr"]` | Hiển thị Zalopay QR multi-function để thanh toán qua Banking và Zalopay trong Zalo |
| `""` | `["international_card"]` | Hiển thị form nhập thông tin credit card |
| `""` | `["bnpl"]` | Hiển thị Zalopay QR, SOF ưu tiên Buy Now Pay Later (BNPL) |

#### Các trường trong `embed_data`

| Parameter | Data Type | Format | Mô tả | Ví dụ |
|-----------|-----------|--------|-------|-------|
| `preferred_payment_method` | Array String | `{"preferred_payment_method": ["value"]}` | Redirect user đến phương thức thanh toán ưu tiên | Xem bảng bank_code ở trên |
| `redirecturl` | String | URL | URL để Zalopay redirect về sau khi customer hoàn tất thanh toán. Hỗ trợ AppLink và WebLink | `{"redirecturl": "https://pay.abc.com/payment/result/Zalopay"}` |
| `columninfo` | JSON String | `{"column_name": "value"}` | Thêm thông tin vào phần quản lý chi tiết giao dịch trên Merchant Tool | `{"columninfo": "{\"branch_id\": \"HCM\",\"store_id\": \"CH123\",\"store_name\": \"Saigon Centre\"}"}` |
| `zlppaymentid` | String | — | Định danh payment info. Dùng khi merchant có nhiều hơn 1 payment info. Chỉ dùng cho merchant có yêu cầu đặc biệt | `{"zlppaymentid": "P4201372"}` |

#### Tạo MAC (Authentication)

```
mac = HMAC(hmac_algorithm, mac_key, hmacinput)

hmacinput = app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item
```

#### Response Parameters

| Parameter | Data Type | Mô tả |
|-----------|-----------|-------|
| `return_code` | Int | Status code |
| `return_message` | String | Mô tả status code |
| `sub_return_code` | Int | Status code chi tiết |
| `sub_return_message` | String | Mô tả status code chi tiết |
| `order_url` | String | Dùng để forward user đến trang Zalopay Gateway |
| `zp_trans_token` | String | Transaction token |
| `qr_code` | String | Dùng để tạo Zalopay QR multi-function trên hệ thống Merchant. Chấp nhận thanh toán từ cả Zalopay & 40+ ngân hàng thuộc hệ thống NAPAS |

---

### API 2: Get Order's Status (`POST /v2/query`)

**Mô tả:** Lấy trạng thái của order

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả |
|-----------|-----------|-----------|----------|-------|
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp |
| `app_trans_id` | String | 40 | M | Mã giao dịch để query (TXID của order) |
| `mac` | String | — | M | Thông tin xác thực |

#### Tạo MAC

```
mac = HMAC(hmac_algorithm, mac_key, hmacinput)

hmacinput = app_id + "|" + app_trans_id + "|" + mac_key
```

#### Response Parameters

| Parameter | Data Type | Mô tả |
|-----------|-----------|-------|
| `return_code` | Int | Status code |
| `return_message` | String | Mô tả status code |
| `sub_return_code` | Int | Status code chi tiết |
| `sub_return_message` | String | Mô tả status code chi tiết |
| `amount` | Long | Số tiền nhận được (chỉ có khi thanh toán thành công) |
| `zp_trans_id` | Long | Mã giao dịch Zalopay, khởi tạo khi user xác nhận thanh toán. Merchant dùng để request refund và đối soát |
| `server_time` | Long | Thời gian giao dịch Zalopay (unix timestamp tính bằng milliseconds) |
| `discount_amount` | Long | Số tiền discount user nhận được |

---

### API 3: Payment Notification / IPN

**Mô tả:** API này được triển khai phía merchant để nhận callback từ Zalopay khi thanh toán thành công.

Nếu Zalopay thu tiền từ user thành công, Zalopay Server sẽ gửi thông báo đến Merchant Server qua callback URL đã đăng ký hoặc `callback_url`.

#### Request từ Zalopay

| Parameter | Data Type | Max Length | Required | Mô tả |
|-----------|-----------|-----------|----------|-------|
| `data` | JSON String | 4096 | M | Dữ liệu callback |
| `mac` | String | 64 | M | Thông tin xác thực |
| `type` | Int | — | M | Loại callback. `1` = Callback order status |

#### Chi tiết tham số `data`

| Parameter | Data Type | Max Length | Mô tả |
|-----------|-----------|-----------|-------|
| `app_id` | Int | — | `app_id` của order |
| `app_trans_id` | String | 40 | `app_trans_id` của order |
| `app_time` | Int64 | — | `app_time` của order |
| `app_user` | String | 50 | `app_user` của order |
| `amount` | Int64 | — | Giá trị order |
| `embed_data` | JSON String | 2048 | `embed_data` của order |
| `item` | JSON Array String | 2048 | `item` của order |
| `zp_trans_id` | String | 64 | Mã giao dịch Zalopay. Merchant dùng để request refund và đối soát |
| `server_time` | Int64 | — | Server timestamp (milliseconds) |
| `channel` | Int | — | Kênh thanh toán |
| `zp_user_id` | String | — | Định danh Zalopay user theo `app_id` của merchant |
| `user_fee_amount` | Int64 | — | Phí order (VNĐ) |
| `discount_amount` | Int64 | — | Discount order (VNĐ) |

#### Tạo MAC (phía Merchant xác thực)

```
mac = HMAC(hmac_algorithm, callback_key, hmacinput)

hmacinput = data
```

#### Response từ Merchant

| Parameter | Data Type | Max Length | Mô tả |
|-----------|-----------|-----------|-------|
| `return_code` | Int | — | `1` = Success, `2` = Failure |
| `return_message` | String | 256 | Mô tả `return_code` |

---

### API 4: Refund Order (`POST /v2/refund`)

**Mô tả:** Hoàn tiền cho order đã thanh toán thành công qua Zalopay

> ⚠️ **Lưu ý:** Refund API là xử lý bất đồng bộ (asynchronous). Sau khi gọi Refund API, merchant cần gọi **Query Refund API** để kiểm tra trạng thái refund.

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả | Ví dụ |
|-----------|-----------|-----------|----------|-------|-------|
| `m_refund_id` | String | 45 | M | Mã giao dịch refund do merchant tạo (TXID). Phải bắt đầu bằng `yymmdd` (GMT+7). Format: `yymmdd_appid_refundidentifier` | `260323_3388_12345676` |
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp |  — |
| `zp_trans_id` | String | 15 | M | Mã giao dịch Zalopay muốn hoàn tiền. Lấy từ callback data hoặc kết quả Get Order's Status API | — |
| `amount` | Long | — | M | Số tiền hoàn trả cho user | — |
| `timestamp` | Long | — | M | Thời gian thực hiện refund (unix timestamp tính bằng milliseconds) | — |
| `mac` | String | — | M | Thông tin xác thực | — |
| `description` | String | 100 | M | Lý do hoàn tiền | — |

#### Tạo MAC

```
mac = HMAC(hmac_algorithm, mac_key, hmacinput)

hmacinput = app_id + "|" + zp_trans_id + "|" + amount + "|" + description + "|" + timestamp
```

#### Response Parameters

| Parameter | Data Type | Mô tả |
|-----------|-----------|-------|
| `return_code` | Int | `1` = Success, `2` = Failure, `3` = Processing |
| `return_message` | String | Mô tả `return_code` |
| `sub_return_code` | Int | Status code chi tiết |
| `sub_return_message` | String | Mô tả `sub_return_code` |
| `refund_id` | Long | Mã giao dịch refund Zalopay. Merchant cần lưu lại để đối soát |

---

### API 5: Get Refund's Status (`POST /v2/query_refund`)

**Mô tả:** Query trạng thái của giao dịch refund

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả |
|-----------|-----------|-----------|----------|-------|
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp |
| `m_refund_id` | String | 45 | M | Mã giao dịch refund do merchant tạo khi query. Format: `yymmdd_appid_xxxxxxxxxx` |
| `timestamp` | Long | — | M | Thời gian gọi API (timestamp tính bằng milliseconds) |
| `mac` | String | — | M | Thông tin xác thực |

#### Tạo MAC

```
mac = HMAC(hmac_algorithm, mac_key, hmacinput)

hmacinput = app_id + "|" + m_refund_id + "|" + timestamp
```

#### Response Parameters

| Parameter | Data Type | Mô tả |
|-----------|-----------|-------|
| `return_code` | Int | Status code |
| `return_message` | String | Mô tả status code |
| `sub_return_code` | Int | Status code chi tiết |
| `sub_return_message` | String | Mô tả status code chi tiết |

---

## Mã lỗi

### 4.1. Create Order

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | -68 | DUPLICATE_APPS_TRANS_ID | `app_trans_id` bị trùng | Query trạng thái order hoặc tạo lại với `app_trans_id` khác |
| 3 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format/thiếu tham số và tạo lại order với giá trị hợp lệ |
| 4 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials, xác thực signature, tạo lại order |
| 5 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Tạo lại order sau một khoảng thời gian |
| 6 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 7 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Tạo lại sau khi bảo trì xong |

### 4.2. Get Order's Status

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | -54 | TIME_INVALID | Giao dịch đã hết hạn | Tạo order mới |
| 3 | 2 | -63 | ZPW_BALANCE_NOT_ENOUGH | User không đủ số dư | Nếu order chưa hết hạn, user có thể nạp tiền và thử lại |
| 4 | 2 | -92 | APPTRANSID_INVALID | `app_trans_id` sai format | Kiểm tra và retry với `app_trans_id` hợp lệ |
| 5 | 2 | -101 | ORDER_NOT_EXIST | `app_trans_id` không tồn tại | Kiểm tra và retry với `app_trans_id` khác |
| 6 | 2 | -217 | BANK_ERROR | Lỗi ngân hàng | Liên hệ Zalopay |
| 7 | 2 | -332, -333 | PROMOTION_ERROR | Thanh toán thất bại do quy tắc chương trình khuyến mãi | Liên hệ Zalopay |
| 8 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format và retry |
| 9 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials và retry |
| 10 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Retry sau một khoảng thời gian |
| 11 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 12 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Retry sau khi bảo trì xong |
| 13 | -1330 đến -1333 | — | EXCEED_MAX_FUND_OUT_PER_DAY | Tài khoản user vượt hạn mức chi tiêu hàng ngày | User có thể thanh toán vào ngày hôm sau |
| 14 | -1340 đến -1343 | — | EXCEED_MAX_FUND_OUT_PER_MONTH | Tài khoản user vượt hạn mức chi tiêu hàng tháng | User có thể thanh toán vào tháng sau |
| 15 | 3 | — | PROCESSING | Order đang xử lý | Nếu chưa hết hạn, tiếp tục gọi API để lấy kết quả cuối cùng |

### 4.3. Refund Order

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 2 | -14 | REFUND_AMOUNT_INVALID | Số tiền refund không hợp lệ | Kiểm tra và tạo lại refund với `amount` khác |
| 2 | 2 | -13 | ORDER_REFUND_EXPIRED | Refund vi phạm hạn thời gian | Kiểm tra và tạo lại với `timestamp` hợp lệ (không vượt quá 15 phút từ khi khởi tạo request) |
| 3 | 2 | -23 | DUPLICATE_M_REFUND_ID | `m_refund_id` bị trùng | Query trạng thái refund hoặc tạo lại với `m_refund_id` khác |
| 4 | 2 | -101 | ORDER_NOT_FOUND | `zp_trans_id` không tồn tại | Kiểm tra và tạo lại refund với `zp_trans_id` khác |
| 5 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format và tạo lại refund request |
| 6 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials và tạo lại refund request |
| 7 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Tạo lại refund request sau một khoảng thời gian |
| 8 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 9 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Tạo lại sau khi bảo trì xong |
| 10 | 3 | — | PROCESSING | Refund đang xử lý | Gọi Query Refund Order's Status API để lấy kết quả cuối cùng |

### 4.4. Get Refund Order's Status

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | 0 | REFUND_FAILED | Refund thất bại | Liên hệ Zalopay |
| 3 | 2 | -13 | REFUND_EXPIRE_TIME | Hết thời hạn refund | Liên hệ Zalopay |
| 4 | 2 | -14 | REFUND_AMOUNT_INVALID | Số tiền refund không hợp lệ | Kiểm tra và tạo lại refund request với `amount` hợp lệ |
| 5 | 2 | -32 | TRANS_NOT_SUPPORT_REFUND | Giao dịch không hỗ trợ refund | Liên hệ Zalopay |
| 6 | 2 | -101 | M_REFUND_ID_NOT_FOUND | `m_refund_id` không tồn tại | Kiểm tra và retry với `m_refund_id` khác |
| 7 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format và tạo lại query request |
| 8 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials và tạo lại query request |
| 9 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Tạo lại query request sau một khoảng thời gian |
| 10 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 11 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Tạo lại sau khi bảo trì xong |
| 12 | 3 | — | PROCESSING | Đang xử lý | Tiếp tục gọi API để lấy kết quả cuối cùng (nếu sub_return_code ≠ -1) |
| 13 | 3 | -1 | REFUND_PENDING | Đang chờ xử lý | Liên hệ Zalopay operation để xử lý |
| 14 | 3 | 2 | REFUND_PROCESSING | Refund đang xử lý | Tiếp tục theo dõi |

---

*Knowledge base này được tạo từ tài liệu tích hợp chính thức Zalopay Payment Gateway và được tối ưu hóa cho AI Agent hỗ trợ merchant tích hợp Zalopay.*

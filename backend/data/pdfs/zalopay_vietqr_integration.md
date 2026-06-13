# Zalopay VietQR Integration — Knowledge Base

> **Nguồn:** Tài liệu tích hợp chính thức Zalopay VietQR (Zalopay QR multi-function)  
> **Mục đích:** Knowledge base cho AI Agent hỗ trợ merchant tích hợp VietQR qua Zalopay  
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

Tài liệu này cung cấp hướng dẫn để doanh nghiệp (merchant) tích hợp phương thức thanh toán **Zalopay QR multi-function (VietQR)** thông qua các API do Zalopay cung cấp.

**VietQR là gì?** VietQR là QR đa năng của Zalopay, cho phép người dùng thanh toán bằng cả ứng dụng Zalopay lẫn hơn 40 ngân hàng thuộc hệ thống NAPAS bằng cách quét một mã QR duy nhất.

---

## Luồng hoạt động

### Sơ đồ flow (7 bước)

```
Customer (Website/Mobile App)
    │
    ▼ [1] Customer chọn thanh toán bằng Zalopay QR multi-function (VietQR)
    │
Merchant Services
    │ [2] Merchant gọi API Create Order
    ▼
Zalopay
    │ [3] Zalopay trả về URL thanh toán (order_url) và mã QR đa năng (qr_code)
    ▼
Merchant Services
    │ [4] Merchant cho phép Customer chọn 1 trong 3 hình thức checkout:
    │     ├── (A) Redirect đến Zalopay Gateway
    │     ├── (B) Hiển thị Zalopay QR multi-function (VietQR) trực tiếp
    │     └── (C) Mở ứng dụng Ngân hàng (Open Bank App via Deeplink)
    ▼
Customer
    [5] Customer thực hiện thanh toán
    │
Zalopay
    [6] Zalopay xử lý thanh toán, trả kết quả, redirect về trang Merchant
    │
Merchant Services
    [7] Merchant nhận kết quả thanh toán và hiển thị cho Customer
```

### Giải thích từng bước

| Bước | Mô tả |
|------|-------|
| 1 | Customer chọn thanh toán bằng Zalopay QR multi-function (VietQR) |
| 2 | Merchant gọi API Create Order để tạo đơn hàng |
| 3 | Zalopay trả về `order_url` (URL thanh toán) và `qr_code` (mã QR đa năng) |
| 4 | Merchant cung cấp cho Customer 1 trong 3 hình thức checkout (A/B/C) |
| 5 | Customer thực hiện thanh toán |
| 6 | Zalopay xử lý thanh toán, trả kết quả và redirect về trang Merchant |
| 7 | Merchant nhận kết quả và hiển thị trạng thái thanh toán cho Customer |

---

## Hướng dẫn tích hợp

Quy trình tích hợp gồm 3 bước chính:

1. Hiển thị tùy chọn thanh toán VietQR trên website/app của Merchant
2. Gọi API Create Order
3. Kích hoạt Zalopay QR multi-function để Customer thanh toán (3 hình thức)

### Bước 1: Hiển thị tùy chọn thanh toán

Khi Customer tiến hành thanh toán, Merchant cần hiển thị phương thức thanh toán Zalopay QR multi-function (VietQR) trên giao diện checkout.

**Giao diện tham khảo:** Hiển thị checkbox hoặc button với icon "Bank transfer via VietQR" kèm logo VietQR.

### Bước 2: Tạo order (Create Order)

Sau khi Customer chọn thanh toán VietQR, Merchant gọi API Create Order với tham số đặc biệt:

```json
"bank_code": "",
"embed_data": "{\"preferred_payment_method\": [\"vietqr\"]}"
```

**Ví dụ Request:**

```json
{
  "app_id": 123015,
  "app_time": 1703664998490,
  "app_trans_id": "231227_123015_1703664997117",
  "app_user": "demo",
  "bank_code": "",
  "description": "Test",
  "amount": 10000,
  "embed_data": "{\"preferred_payment_method\": [\"vietqr\"]}",
  "item": "[]",
  "mac": "0336b57f74209f3b944c88b8fc8c878ae518d20b7e88763fb2ff9e14e6c3cac5"
}
```

**Ví dụ Response:**

```json
{
  "return_code": 1,
  "return_message": "Giao dịch thành công",
  "sub_return_code": 1,
  "sub_return_message": "Giao dịch thành công",
  "zp_trans_token": "AC5TYXNLtPgMkO-IBA2_VoBA",
  "order_url": "https://qcgateway.zalopay.vn/openinapp?order=...",
  "order_token": "AC5TYXNLtPgMkO-IBA2_VoBA",
  "qr_code": "00020101021226520010vn.zalopay..."
}
```

### Bước 3: Kích hoạt VietQR — 3 hình thức checkout

---

#### Hình thức A: Redirect đến Zalopay Gateway

Merchant dùng giá trị `order_url` nhận được từ response để điều hướng Customer đến Zalopay Payment Gateway. Zalopay Gateway sẽ tự động hiển thị mã VietQR cho Customer quét và thanh toán.

**Khi nào dùng:** Phù hợp khi Merchant muốn Zalopay xử lý toàn bộ UI thanh toán, không cần tự render QR.

---

#### Hình thức B: Hiển thị Zalopay QR multi-function (VietQR) trực tiếp

Merchant dùng giá trị `qr_code` từ response để tự render mã VietQR và hiển thị trực tiếp trên hệ thống (Web / App / POS). Customer dùng ứng dụng Ngân hàng hoặc Zalo/Zalopay để quét QR và thanh toán.

**Khi nào dùng:** Phù hợp khi Merchant muốn tích hợp QR ngay trong giao diện của mình, không redirect ra ngoài. Đặc biệt hiệu quả với POS system tại quầy.

**Lưu ý kỹ thuật:** Giá trị `qr_code` tuân theo chuẩn EMVCo QR, có thể dùng bất kỳ thư viện generate QR image nào để render.

---

#### Hình thức C: Mở ứng dụng Ngân hàng (Open Bank Application via Deeplink)

Merchant dùng deeplinks của các ứng dụng Ngân hàng do Zalopay cung cấp, cho phép Customer mở trực tiếp ứng dụng Ngân hàng trên thiết bị di động để thanh toán.

**Quy trình chi tiết:**

```
CreateOrder Step:
  [1] Customer chọn VietQR
  [2] Merchant Client gửi VietQR payment request đến Merchant Server/PSP
  [3] Merchant Server gọi CreateOrder API lên Zalopay
  [4] Zalopay trả về order_token

GetBankDeepLinks Step:
  [5] Merchant Server gọi GetBankDeeplinks API với order_token vừa nhận
  [6] Zalopay trả về danh sách bank deep links đã pre-filled order info
  [7] Merchant Server trả deep links về Merchant Client
  [8] Merchant Client render danh sách ngân hàng

  [9]  Customer chọn ngân hàng cụ thể
  [10] Redirect Customer đến Bank App
  [11] Customer thực hiện thanh toán

Handle Payment Result:
  [Alt] Zalopay gửi callback kết quả thanh toán về Merchant Server
  [12] Bank App trả về Merchant Client
  [13] Merchant Client query trạng thái order
  [14] Merchant Server gọi QueryOrder API lên Zalopay
  [15] Zalopay trả về trạng thái order
  [16] Merchant Server trả trạng thái về Merchant Client
  [17] Merchant Client hiển thị trạng thái đơn hàng
```

**Zalopay hỗ trợ 2 loại deeplink:**

| Loại | `is_auto_fill` | Mô tả |
|------|---------------|-------|
| **Loại 1 — Không hỗ trợ Auto Fill** | `false` | Deeplink chỉ mở app ngân hàng. Customer phải tự nhập thông tin chuyển khoản |
| **Loại 2 — Hỗ trợ Auto Fill** | `true` | Deeplink tự điền thông tin order, Customer chỉ cần xác nhận thanh toán mà không cần nhập gì |

> **Khuyến nghị:** Zalopay khuyến nghị mạnh mẽ Merchant truyền tham số `order_token` khi gọi GetBankDeeplinks API để được deeplinks với thông tin order đã điền sẵn.

**Ví dụ Response GetBankDeeplinks:**

```json
{
  "return_code": 1,
  "return_message": "Thành công",
  "sub_return_code": 1,
  "sub_return_message": "Thành công.",
  "data": [
    {
      "bank_code": "MSB",
      "short_name": "MSB",
      "full_name": "Ngân hàng Thương mại Cổ phần Hàng Hải Việt Nam",
      "logo_url": "https://scdn.zalopay.vn/data/ofp/emvcoqr/banks/MSB.png",
      "deep_link": "msbmbank://applink",
      "is_auto_fill": true
    },
    {
      "bank_code": "BIDV",
      "short_name": "BIDV",
      "full_name": "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
      "logo_url": "https://scdn.zalopay.vn/data/ofp/emvcoqr/banks/BIDV.png",
      "deep_link": "bidv.smartbanking.partner://payment",
      "is_auto_fill": true
    },
    {
      "bank_code": "VIB",
      "short_name": "VIB",
      "full_name": "Ngân hàng TMCP Quốc tế Việt Nam",
      "logo_url": "https://scdn.zalopay.vn/data/ofp/emvcoqr/banks/VIB.png",
      "deep_link": "myvib2://",
      "is_auto_fill": false
    }
  ]
}
```

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
| Get List Bank Deeplinks | `POST /zps/api/v2/get_bank_deep_link` | Merchant → Zalopay |
| Get Order's Status | `POST /v2/query` | Merchant → Zalopay |
| Refund Order | `POST /v2/refund` | Merchant → Zalopay |
| Get Refund Order's Status | `POST /v2/query_refund` | Merchant → Zalopay |
| Payment Notification (IPN) | URL do Merchant cung cấp | Zalopay → Merchant |

> **Lưu ý:** So với Payment Gateway Integration, VietQR Integration có thêm API **Get List Bank Deeplinks** — đây là API đặc thù chỉ có trong luồng VietQR.

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
| `description` | String | 256 | M | Mô tả order, hiển thị cho user trên Zalopay app | `Merchant Name - Payment for the order 240327_12345676` |
| `callback_url` | String | — | O | URL nhận callback kết quả thanh toán từ Zalopay. Có thể truyền động cho từng order hoặc cấu hình mặc định | — |
| `sub_app_id` | String | 50 | O | Định danh service/nhóm service dùng để thanh toán trong app của merchant. Một số merchant đặc thù cần truyền khi tạo order | — |
| `item` | JSON Array String | 2048 | M | Dữ liệu bổ sung do merchant định nghĩa. Dùng `[]` khi trống | — |
| `embed_data` | JSON String | 1024 | M | Dữ liệu embed của merchant. Dùng `{}` khi trống | — |
| `mac` | String | — | M | Thông tin xác thực (authentication) | — |
| `bank_code` | String | 20 | O | Dùng cho thanh toán online qua Zalopay Gateway. Xem bảng `bank_code` bên dưới | — |

> **Lưu ý:** `embed_data` trong VietQR Integration có Max Length **1024** (khác với Payment Gateway Integration là 2048).

#### Bảng bank_code và preferred_payment_method

| `bank_code` | `preferred_payment_method` | Kết quả hiển thị trên Zalopay Gateway |
|-------------|---------------------------|--------------------------------------|
| `""` | `[]` | Tất cả phương thức và ngân hàng được hỗ trợ (ATM, CC, Zalopay QR, Apple Pay...) |
| `""` | `["domestic_card", "account"]` | Danh sách ngân hàng, user chọn và nhập thông tin ATM card / Bank account |
| `""` | `["zalopay_wallet"]` | Hiển thị Zalopay QR để thanh toán qua Zalopay/Zalopay trong Zalo |
| `""` | `["vietqr"]` | **Hiển thị Zalopay QR multi-function** để thanh toán qua Banking và Zalopay trong Zalo ← **Dùng cho VietQR** |
| `""` | `["international_card"]` | Hiển thị form nhập thông tin credit card |
| `""` | `["applepay"]` | Hiển thị form chọn phương thức Apple Pay |

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
| `order_url` | String | Dùng để forward user đến trang Zalopay Gateway (Hình thức A) |
| `zp_trans_token` | String | Transaction token |
| `qr_code` | String | Dùng để tạo Zalopay QR multi-function (VietQR) trên hệ thống Merchant (Hình thức B). Chấp nhận cả Zalopay & 40+ ngân hàng NAPAS |

---

### API 2: Get List Bank Deeplinks (`POST /zps/api/v2/get_bank_deep_link`)

**Mô tả:** Lấy danh sách deeplink của các ứng dụng ngân hàng hỗ trợ VietQR. API này **đặc thù cho VietQR Integration**, không có trong Payment Gateway Integration.

> **Khuyến nghị của Zalopay:** Luôn truyền tham số `order_token` khi gọi API này để nhận deeplinks đã được điền sẵn thông tin order, giúp Customer không cần nhập gì khi mở app ngân hàng.

#### Request Parameters

| Parameter | Data Type | Required | Mô tả | Ví dụ |
|-----------|-----------|----------|-------|-------|
| `app_id` | Int | M | Định danh app của merchant do Zalopay cấp | — |
| `bank_codes` | String | O | Danh sách mã ngân hàng muốn lấy deeplink, phân cách bằng dấu phẩy, không có dấu cách | `BIDV,VTB` |
| `os_type` | String | M | Loại hệ điều hành của thiết bị. Giá trị: `ios` hoặc `android` | `ios` |
| `order_token` | String | O | Giá trị `order_token` từ response Create Order API. Giúp deeplink tự điền thông tin order cho các ngân hàng hỗ trợ | — |
| `mac` | String | M | Thông tin xác thực | — |

#### Tạo MAC

```
mac = HMAC(hmac_algorithm, mac_key, hmacinput)

hmacinput = app_id + "|" + bank_codes + "|" + os_type + "|" + order_token
```

#### Response Parameters

| Parameter | Data Type | Mô tả |
|-----------|-----------|-------|
| `return_code` | Int | Return code |
| `return_message` | String | Mô tả return code |
| `sub_return_code` | Int | Return code chi tiết |
| `sub_return_message` | String | Mô tả sub return code |
| `data` | Array Object | Dữ liệu deeplink của các ngân hàng |

#### Chi tiết trường trong `data`

| Field | Data Type | Mô tả |
|-------|-----------|-------|
| `bank_code` | String | Mã định danh ngân hàng trong hệ thống Zalopay |
| `short_name` | String | Tên viết tắt của ngân hàng |
| `full_name` | String | Tên đầy đủ của ngân hàng |
| `logo_url` | String | URL logo ngân hàng |
| `is_auto_fill` | Boolean | `true` = hỗ trợ auto fill; `false` = không hỗ trợ auto fill |
| `deep_link` | String | Deeplink của ứng dụng ngân hàng. Nếu `is_auto_fill = true`: deeplink đã điền sẵn thông tin order. Nếu `is_auto_fill = false`: deeplink chỉ mở app, user tự nhập |

> **Lưu ý về `order_token`:** Khi Merchant truyền `order_token` trong request, Zalopay sẽ trả về deeplink đã điền sẵn thông tin order cho các ngân hàng hỗ trợ. Nếu không truyền `order_token`, `deep_link` vẫn được trả về nhưng sẽ không có thông tin order — trường hợp này phù hợp để hiển thị danh sách ngân hàng trước khi tạo order.

---

### API 3: Get Order's Status (`POST /v2/query`)

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
| `zp_trans_id` | Long | Mã giao dịch Zalopay. Merchant dùng để request refund và đối soát |
| `server_time` | Long | Thời gian giao dịch Zalopay (unix timestamp tính bằng milliseconds) |
| `discount_amount` | Long | Số tiền discount user nhận được |

---

### API 4: Payment Notification / IPN

**Mô tả:** API này được triển khai phía merchant để nhận callback từ Zalopay khi thanh toán thành công.

#### Request từ Zalopay

| Parameter | Data Type | Max Length | Required | Mô tả |
|-----------|-----------|-----------|----------|-------|
| `data` | JSON String | 4096 | M | Dữ liệu callback |
| `mac` | String | 64 | M | Thông tin xác thực |
| `type` | Int | — | M | Loại callback: `1` = Callback order status; `2` = Callback binding status |

#### Chi tiết tham số `data`

| Parameter | Data Type | Max Length | Mô tả |
|-----------|-----------|-----------|-------|
| `app_id` | Int | — | `app_id` của order |
| `app_trans_id` | String | 40 | `app_trans_id` của order |
| `app_time` | Int64 | — | `app_time` của order |
| `app_user` | String | 50 | `app_user` của order |
| `amount` | Int64 | — | Giá trị order |
| `embed_data` | JSON String | 1024 | `embed_data` của order |
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

### API 5: Refund Order (`POST /v2/refund`)

**Mô tả:** Hoàn tiền cho order đã thanh toán thành công qua Zalopay

> ⚠️ **Lưu ý:** Refund API là xử lý bất đồng bộ (asynchronous). Sau khi gọi Refund API, merchant cần gọi **Query Refund API** để kiểm tra trạng thái refund.

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả | Ví dụ |
|-----------|-----------|-----------|----------|-------|-------|
| `m_refund_id` | String | 45 | M | Mã giao dịch refund do merchant tạo (TXID). Phải bắt đầu bằng `yymmdd` (GMT+7). Format: `yymmdd_appid_refundidentifier` | `240327_3388_12345676` |
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp | — |
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

### API 6: Get Refund's Status (`POST /v2/query_refund`)

**Mô tả:** Query trạng thái của giao dịch refund (Refund API là bất đồng bộ nên cần gọi API này để lấy kết quả cuối)

#### Request Parameters

| Parameter | Data Type | Max Length | Required | Mô tả |
|-----------|-----------|-----------|----------|-------|
| `app_id` | Int | — | M | Định danh app của merchant do Zalopay cấp |
| `m_refund_id` | String | 45 | M | Mã giao dịch refund do merchant tạo. Format: `yymmdd_appid_xxxxxxxxxx` |
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

### 6.1. Create Order

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | -68 | DUPLICATE_APPS_TRANS_ID | `app_trans_id` bị trùng | Query trạng thái order hoặc tạo lại với `app_trans_id` khác |
| 3 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format/thiếu tham số và tạo lại order với giá trị hợp lệ |
| 4 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials, xác thực signature, tạo lại order |
| 5 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Tạo lại order sau một khoảng thời gian |
| 6 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 7 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Tạo lại sau khi bảo trì xong |

### 6.2. Get List Bank Deeplinks

> Đây là bảng mã lỗi **đặc thù cho VietQR Integration**, không có trong Payment Gateway Integration.

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | -6100 | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 3 | 2 | -6101 | APP_ID_INVALID | `app_trans_id` không hợp lệ | Kiểm tra và retry với `app_trans_id` khác |
| 4 | 2 | -6102 | OS_TYPE_INVALID | `os_type` không hợp lệ | Kiểm tra và retry với `os_type` hợp lệ (`ios` hoặc `android`) |
| 5 | 2 | -6103 | MAC_INVALID | App code hoặc signature không hợp lệ | Kiểm tra credentials, xác thực signature, retry |
| 6 | 2 | -6105 | BANK_CODES_INVALID | `bank_codes` không hợp lệ | Kiểm tra và retry với `bank_codes` khác |
| 7 | 2 | -6106 | ORDER_TOKEN_INVALID | `order_token` không hợp lệ | Kiểm tra và retry với `order_token` khác |
| 8 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |

### 6.3. Get Order's Status

| No. | return_code | sub_return_code | Short Description | Ý nghĩa | Cách xử lý |
|-----|-------------|-----------------|-------------------|---------|-----------|
| 1 | 1 | 1 | SUCCESS | Thành công | — |
| 2 | 2 | -54 | TIME_INVALID | Giao dịch đã hết hạn | Tạo order mới |
| 3 | 2 | -63 | ZPW_BALANCE_NOT_ENOUGH | User không đủ số dư | Nếu order chưa hết hạn, user có thể nạp tiền và thử lại |
| 4 | 2 | -92 | APPTRANSID_INVALID | `app_trans_id` sai format | Kiểm tra và retry với `app_trans_id` hợp lệ |
| 5 | 2 | -101 | ORDER_NOT_EXIST | `app_trans_id` không tồn tại | Kiểm tra và retry với `app_trans_id` khác |
| 6 | 2 | -217 | BANK_ERROR | Lỗi ngân hàng | Liên hệ Zalopay |
| 7 | 2 | -332, -333 | PROMOTION_ERROR | Thanh toán thất bại do quy tắc khuyến mãi | Liên hệ Zalopay |
| 8 | -401 | — | ILLEGAL_DATA_REQUEST | Tham số request sai format | Kiểm tra format và retry |
| 9 | -402 | — | ILLEGAL_APP/SIGNATURE_REQUEST | App code hoặc signature không hợp lệ | Kiểm tra credentials và retry |
| 10 | -429 | — | LIMIT_REQUEST_REACH | Vượt rate limit | Retry sau một khoảng thời gian |
| 11 | -500 | — | SYSTEM_ERROR | Lỗi hệ thống | Liên hệ Zalopay |
| 12 | -999 | — | SYSTEM_MAINTENANCE | Hệ thống bảo trì | Retry sau khi bảo trì xong |
| 13 | 2 | -1330 đến -1333 | EXCEED_MAX_FUND_OUT_PER_DAY | Tài khoản user vượt hạn mức chi tiêu hàng ngày | User có thể thanh toán vào ngày hôm sau |
| 14 | 2 | -1340 đến -1343 | EXCEED_MAX_FUND_OUT_PER_MONTH | Tài khoản user vượt hạn mức chi tiêu hàng tháng | User có thể thanh toán vào tháng sau |
| 15 | 3 | — | PROCESSING | Order đang xử lý | Nếu chưa hết hạn, tiếp tục gọi API để lấy kết quả cuối cùng |

### 6.4. Refund Order

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

### 6.5. Get Refund Order's Status

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
| 12 | 3 | — | PROCESSING | Đang xử lý | Tiếp tục gọi API nếu sub_return_code ≠ -1 |
| 13 | 3 | -1 | REFUND_PENDING | Đang chờ xử lý | Liên hệ Zalopay operation để xử lý |
| 14 | 3 | 2 | REFUND_PROCESSING | Refund đang xử lý | Tiếp tục theo dõi |

---

## So sánh nhanh: VietQR vs Payment Gateway Integration

| Điểm khác biệt | Payment Gateway Integration | VietQR Integration |
|---------------|----------------------------|--------------------|
| Số lượng API | 5 | 6 (thêm Get List Bank Deeplinks) |
| `embed_data` max length | 2048 | **1024** |
| `sub_app_id` | Không có | **Có** (Optional) |
| Checkout options | 1 (redirect Gateway) | **3** (Gateway / QR trực tiếp / Bank App deeplink) |
| `applepay` trong preferred_method | Không có | **Có** |
| Payment Notification `type` | Chỉ `1` | `1` và **`2` (binding status)** |
| API đặc thù | — | **Get List Bank Deeplinks** + error codes -6100 đến -6106 |

---

*Knowledge base này được tạo từ tài liệu tích hợp chính thức Zalopay VietQR Integration và được tối ưu hóa cho AI Agent hỗ trợ merchant tích hợp Zalopay QR multi-function (VietQR).*

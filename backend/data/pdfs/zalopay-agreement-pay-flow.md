# Zalopay Agreement Pay — Wallet Token Integration Flow

> **Nguồn:** https://docs.zalopay.vn/vi/docs/guides/payment-acceptance/tokenization/wallet-token  
> **Cập nhật lần cuối:** 15/11/2024  
> **Loại tính năng:** Thanh toán tự động (Auto Debit) — trích nợ tự động qua Token ví Zalopay

---

## Tổng quan

Thanh toán tự động (Auto Debit) cho phép merchant tự động trừ tiền từ số dư ví Zalopay của người dùng sau khi người dùng đã đăng ký một **agreement (hợp đồng liên kết)**.

**Use case điển hình:** Subscription, đặt xe, thanh toán định kỳ — người dùng không cần thao tác lại mỗi lần.

---

## Tiền điều kiện

Trước khi tích hợp, đảm bảo:

- Đã đăng ký tài khoản merchant tại [mc.zalopay.vn](https://mc.zalopay.vn) và có `app_id`, `mac_key`
- Hiểu cách hoạt động của các API:
  - `CreateBinding API` — tạo liên kết agreement
  - `QueryPaymentToken API` — truy vấn trạng thái liên kết
  - `QueryBalance API` — kiểm tra số dư trước khi trích nợ
  - `CreateOrder API` — tạo đơn hàng thanh toán
  - `PayByToken API` — thực hiện trích nợ
  - `Unbind API` — hủy liên kết
  - `QueryUser API` — truy vấn thông tin người dùng
- Nắm được cơ chế [callback](https://docs.zalopay.vn/vi/docs/developer-tools/knowledge-base/callback) và [truyền dữ liệu an toàn](https://docs.zalopay.vn/vi/docs/developer-tools/security/secure-data-transmission)

---

## Luồng tích hợp (4 bước)

```
Bước 1: Khởi tạo liên kết agreement
    → Gọi CreateBinding API
    → Hiển thị QR / deep_link cho user xác nhận
    → Nhận pay_token qua callback

Bước 2: Thanh toán bằng Token
    → Kiểm tra số dư: QueryBalance API
    → Tạo đơn hàng: CreateOrder API → nhận zp_trans_token
    → Kích hoạt thanh toán: PayByToken API
    → Nhận kết quả qua callback

Bước 3: Hủy liên kết (khi user yêu cầu)
    → Gọi Unbind API với binding_id

Bước 4: Truy vấn thông tin người dùng
    → Gọi QueryUser API với pay_token
```

---

## Bước 1 — Khởi tạo liên kết Agreement

### 1.1 Gọi CreateBinding API

```js
// src/api/agreement/bind/index.js
import axios from "axios";
import CryptoJS from "crypto-js";
import { API_ROUTES, configZLP, ZLP_API_PATH } from "../../config";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const binding_data = {};
    const bind = {
      app_id: configZLP.app_id,
      app_trans_id: req.body.appTransID,
      req_date: Date.now(), // milliseconds
      identifier: "ZLP User",
      max_amount: 0,
      binding_type: 'WALLET',
      binding_data: JSON.stringify(binding_data),
      callback_url: configZLP.host + API_ROUTES.AGREEMENT_CALLBACK,
      redirect_url: "http://localhost:3000/cart"
    };

    // MAC = HMAC-SHA256(app_id|app_trans_id|binding_data|binding_type|identifier|max_amount|req_date)
    const data = configZLP.app_id + "|" + bind.app_trans_id + "|" + bind.binding_data + "|" + bind.binding_type + "|" + bind.identifier + "|" + bind.max_amount + "|" + bind.req_date;
    bind.mac = CryptoJS.HmacSHA256(data, configZLP.key1).toString();

    const result = await axios.post(configZLP.zlp_endpoint + ZLP_API_PATH.AGREEMENT_BINDING, null, { params: bind });
    // return_code === 1 → thành công
  }
}
```

**Response mẫu:**
```json
{
  "return_code": 1,
  "binding_token": "220428XjNBVZQ7gD2ebs2gVL1E87MBVp",
  "deep_link": "zalopay://launch/app/730?view=authorize&b=220428XjNBVZQ7gD2ebs2gVL1E87MBVp",
  "binding_qr_link": "https://sbbinding.zalopay.vn?binding_token=220428XjNBVZQ7gD2ebs2gVL1E87MBVp",
  "short_link": "https://zlpmcagp.zalopay.vn/oauthbe/agreement/220428XjNBVZQ7gD2ebs2gVL1E87MBVp"
}
```

### 1.2 Hiển thị cho user xác nhận

| Link | Dùng khi nào |
|------|-------------|
| `deep_link` | Mở trực tiếp app Zalopay (mobile) |
| `binding_qr_link` | Web — Zalopay đã tạo sẵn QR code |
| `short_link` | Web — merchant tự tạo QR từ URL này |

Sau khi user xác nhận, Zalopay redirect về `redirect_url` kèm params:
- `binding_id` — ID liên kết đã được chấp thuận
- `status` — 1: thành công, khác: thất bại

### 1.3 Nhận callback liên kết

Zalopay gọi POST đến `callback_url`. Dữ liệu quan trọng trong callback:

| Trường | Mô tả |
|--------|-------|
| `pay_token` | **Token dùng cho mọi lần thanh toán sau** — lưu lại |
| `binding_id` | ID liên kết trong hệ thống Zalopay |
| `status` | 1: confirmed, 3: cancelled, 4: disabled |
| `zp_user_id` | ID người dùng Zalopay |
| `masked_user_phone` | SĐT đã che (VD: `****6938`) |

```js
// Xác thực callback
const mac = CryptoJS.HmacSHA256(dataStr, configZLP.key2).toString();
if (reqMac !== mac) {
  // KHÔNG hợp lệ — từ chối
  return { return_code: -1, return_message: "mac not equal" };
}
// Lưu pay_token vào database
```

> ⚠️ **Quan trọng:**
> - Luôn xác thực MAC với `key2` (callback key)
> - `callback_url` phải cùng domain với server của merchant
> - `callback_url` phải public (không đứng sau firewall/VPN)
> - Liên kết hết hạn sau **15 phút** nếu user không xác nhận

### 1.4 Truy vấn trạng thái liên kết (chủ động)

Dùng `QueryPaymentToken API` để kiểm tra thay vì chỉ chờ callback:

```js
// src/api/agreement/query/index.js
let postData = {
  app_id: configZLP.app_id,
  app_trans_id: req.body.appTransID,
  req_date: Date.now(),
};
// MAC = HMAC-SHA256(app_id|app_trans_id|req_date)
postData.mac = CryptoJS.HmacSHA256(
  postData.app_id + "|" + postData.app_trans_id + "|" + postData.req_date,
  configZLP.key1
).toString();
```

---

## Bước 2 — Thanh toán bằng Token

### 2.1 Kiểm tra số dư (QueryBalance API)

```js
// src/api/agreement/balance/index.js
let postData = {
  app_id: configZLP.app_id,
  identifier: "ZLP User",
  pay_token: req.body.payToken,
  amount: req.body.amount,
  req_date: Date.now(),
};
// MAC = HMAC-SHA256(app_id|pay_token|identifier|amount|req_date)
postData.mac = CryptoJS.HmacSHA256(
  postData.app_id + "|" + postData.pay_token + "|" + postData.identifier + "|" + postData.amount + "|" + postData.req_date,
  configZLP.key1
).toString();
```

**Response:**
```json
{
  "return_code": 1,
  "data": [{ "channel": 38, "payable": true, "bank_code": "" }]
}
```

**Quyết định tiếp theo:**

| return_code | payable | Hành động |
|-------------|---------|-----------|
| 1 | true | → Gọi CreateOrder rồi PayByToken |
| 1 | false | → Không gọi PayByToken |
| 2 | — | → Không gọi PayByToken |

### 2.2 Tạo đơn hàng (CreateOrder API)

```js
// src/api/create/index.js
const order = {
  app_id: configZLP.app_id,
  app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
  app_user: "user123",
  app_time: Date.now(),
  item: JSON.stringify(items),
  embed_data: JSON.stringify({ zlppaymentid: "P271021" }),
  amount: 50000,
  description: `Payment for the order #${transID}`,
  bank_code: "zalopayapp",
  callback_url: configZLP.callback_url
};
// MAC = HMAC-SHA256(app_id|app_trans_id|app_user|amount|app_time|embed_data|item)
order.mac = CryptoJS.HmacSHA256(
  [order.app_id, order.app_trans_id, order.app_user, order.amount, order.app_time, order.embed_data, order.item].join("|"),
  configZLP.key1
).toString();
```

**Response:**
```json
{
  "return_code": 1,
  "zp_trans_token": "20090400000112548Y3z18",
  "order_url": "https://sbgateway.zalopay.vn/openinapp?order=..."
}
```

### 2.3 Kích hoạt thanh toán (PayByToken API)

```js
// src/api/agreement/pay/index.js
const postData = {
  app_id: configZLP.app_id,
  identifier: "ZLP User",
  pay_token: req.body.payToken,
  zp_trans_token: req.body.zpTransToken,
  req_date: Date.now(),
};
// MAC = HMAC-SHA256(app_id|identifier|zp_trans_token|pay_token|req_date)
postData.mac = CryptoJS.HmacSHA256(
  configZLP.app_id + "|" + postData.identifier + "|" + postData.zp_trans_token + "|" + postData.pay_token + "|" + postData.req_date,
  configZLP.key1
).toString();
```

### 2.4 Callback đơn hàng thanh toán

Xử lý tương tự Dynamic QR callback — xác thực MAC, cập nhật trạng thái đơn hàng.

---

## Bước 3 — Hủy liên kết

Gọi `Unbind API` với `binding_id`:

```json
// Response
{
  "return_code": 1,
  "return_message": "...",
  "sub_return_code": 1,
  "sub_return_message": "..."
}
```

> **Lưu ý:** User cũng có thể hủy liên kết từ Zalopay App. Trong trường hợp đó, merchant nhận callback hủy qua `callback_url` ban đầu.

---

## Bước 4 — Truy vấn thông tin người dùng

Dùng `pay_token` để gọi `QueryUser API`:

```json
// Response
{
  "phone": "****2606",
  "return_code": 1,
  "return_message": "..."
}
```

> Hiện tại API chỉ trả về số điện thoại đã được che (masked phone).

---

## Tóm tắt MAC Formula

| API | Công thức MAC |
|-----|--------------|
| CreateBinding | `app_id\|app_trans_id\|binding_data\|binding_type\|identifier\|max_amount\|req_date` |
| QueryPaymentToken | `app_id\|app_trans_id\|req_date` |
| QueryBalance | `app_id\|pay_token\|identifier\|amount\|req_date` |
| CreateOrder | `app_id\|app_trans_id\|app_user\|amount\|app_time\|embed_data\|item` |
| PayByToken | `app_id\|identifier\|zp_trans_token\|pay_token\|req_date` |
| Callback verify | dùng `key2` (callback key), không phải `key1` |

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `mac not equal` | Sai thứ tự field trong chuỗi MAC, hoặc dùng sai key | Kiểm tra lại công thức MAC theo bảng trên |
| Callback không nhận được | URL không public, server không response đúng | Đảm bảo callback URL public; luôn return `{ return_code: 1 }` khi xử lý xong |
| Liên kết hết hạn | User không xác nhận trong 15 phút | Tạo lại binding mới |
| `payable: false` | Số dư không đủ | Không gọi PayByToken; thông báo user nạp tiền |

---

## Tài nguyên tham khảo

- [Demo app](https://zalopay-tokenized-payment.vercel.app)
- [GitHub sample (Next.js)](https://github.com/zalopay-samples/quickstart-nextjs-tokenized-payment)
- [API Explorer](https://docs.zalopay.vn/vi/docs/specs/openapi)
- [Status codes](https://docs.zalopay.vn/vi/docs/developer-tools/knowledge-base/status-codes)
- [Callback guide](https://docs.zalopay.vn/vi/docs/developer-tools/knowledge-base/callback)

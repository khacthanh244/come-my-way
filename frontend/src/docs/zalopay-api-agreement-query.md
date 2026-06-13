---
api_name: Truy vấn mã thông báo thanh toán của một liên kết
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-query
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Truy vấn mã thông báo thanh toán của một liên kết

API này dùng để truy vấn thông tin liên kết của người dùng (bao gồm cả `pay_token` và trạng thái liên kết) bằng `app_trans_id` đã thực hiện liên kết trước đó.

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`app_trans_id`**: `string` (required)
    ID giao dịch duy nhất của ứng dụng, định dạng: `yyMMddxxxxxxxxx`. Độ dài tối đa là 40 ký tự. Ví dụ: `180208181007242`.
*   **`req_date`**: `int64` (required)
    Thời điểm hiện tại tính bằng mili giây (milliseconds).
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào như sau:
    `hmacinput = app_id + | + apps_trans_id + | + req_date;`
    và sử dụng SHA256 với khóa HMAC của ứng dụng làm khóa chữ ký.

## MAC Formula

```text
hmacinput = app_id + "|" + app_trans_id + "|" + req_date;
```
> **Note [typo trong docs gốc]:** Trong công thức tính MAC ở tài liệu gốc viết là `apps_trans_id` [typo trong docs gốc]. Merchant cần sử dụng giá trị của trường **`app_trans_id`** để ghép chuỗi MAC.

*   **Thuật toán:** SHA256
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Mã trả về:
    *   `1` - THÀNH CÔNG
    *   `2` - THẤT BẠI
    *   `3` - ĐANG CHỜ
*   **`return_message`**: `string`
    Mô tả mã trạng thái trả về.
*   **`sub_return_code`**: `integer`
    Mã lỗi chi tiết.
*   **`sub_return_message`**: `string`
    Thông báo lỗi chi tiết.
*   **`data`**: `object`
    Chi tiết thông tin liên kết:
    *   **`app_id`**: `int64` - "App ID" của nhà cung cấp.
    *   **`app_trans_id`**: `string` - ID duy nhất của nhà cung cấp cho liên kết.
    *   **`binding_id`**: `string` - ID của liên kết đã được xác nhận trong hệ thống Zalopay.
    *   **`pay_token`**: `string` - "Public token" được sử dụng khi thực hiện tự động trừ tiền.
    *   **`server_time`**: `int64` - Thời điểm của máy chủ (server timestamp) tính bằng giây (seconds).
    *   **`merchant_user_id`**: `string` - Trường "identifier" trong yêu cầu liên kết.
    *   **`status`**: `integer` - Trạng thái liên kết: `1`: Đã xác nhận, `3`: Đã hủy, `4`: Đã vô hiệu hóa.
    *   **`msg_type`**: `integer` - Loại tin nhắn: `1`: Người dùng xác nhận một hợp đồng, `2`: Người dùng cập nhật hợp đồng.
    *   **`zp_user_id`**: `string` - Định danh của người dùng Zalopay theo `app_id` của nhà cung cấp.
    *   **`masked_user_phone`**: `string` - Số điện thoại của người dùng bị ẩn (Ví dụ: `****6938`).

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "data": {
    "app_id": 0,
    "app_trans_id": "string",
    "binding_id": "string",
    "pay_token": "string",
    "server_time": 0,
    "merchant_user_id": "string",
    "status": 1,
    "msg_type": 1,
    "zp_user_id": "string",
    "masked_user_phone": "string"
  }
}
```

## Lỗi thường gặp

- **Giao dịch liên kết không tồn tại**
  * *Nguyên nhân:* Sai `app_trans_id` hoặc giao dịch này chưa từng được gửi đi để khởi tạo liên kết.
  * *Cách fix:* Kiểm tra lại giá trị `app_trans_id` trong database của Merchant khớp với mã đã gọi API thiết lập liên kết ban đầu.
- **mac not equal**
  * *Nguyên nhân:* Sử dụng biến `apps_trans_id` dạng rỗng hoặc sai thứ tự chuỗi MAC, hoặc dùng nhầm **key2** thay vì **key1**.
  * *Cách fix:* Ghép chuỗi theo công thức `app_id|app_trans_id|req_date` (sử dụng đúng field `app_trans_id` của request) và mã hóa bằng **key1**.
- **Liên kết đang chờ xác nhận (return_code = 3)**
  * *Nguyên nhân:* Người dùng mở liên kết nhưng chưa xác nhận đồng ý liên kết trên ví Zalopay.
  * *Cách fix:* Chờ đợi callback từ Zalopay hoặc tiếp tục truy vấn định kỳ (polling) với giãn cách hợp lý cho đến khi nhận được trạng thái cuối cùng (thành công/thất bại).

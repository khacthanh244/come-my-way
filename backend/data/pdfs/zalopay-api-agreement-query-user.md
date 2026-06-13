---
api_name: Truy vấn thông tin cơ bản của người dùng
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-query-user
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Truy vấn thông tin cơ bản của người dùng

API này được dùng để lấy thông tin cơ bản (ví dụ số điện thoại đã được ẩn) của người dùng đã liên kết dịch vụ dựa vào `access_token` (`pay_token`).

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`access_token`**: `string` (required)
    "Access token" của người dùng sau khi liên kết thành công. (Đây chính là giá trị `pay_token` nhận từ API liên kết).
*   **`req_date`**: `int64` (required)
    Thời điểm hiện tại tính bằng mili giây (milliseconds).
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào như sau:
    `hmacinput = app_id + | + access_token + | + req_date;`
    và sử dụng SHA256 với khóa HMAC của ứng dụng làm khóa chữ ký.

## MAC Formula

```text
hmacinput = app_id + "|" + access_token + "|" + req_date;
```
*   **Thuật toán:** SHA256
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Mã trả về:
    *   `1` - Thành công
    *   `2` - Thất bại
    *   `3` - Đang xử lý
*   **`return_message`**: `string`
    Mô tả trạng thái trả về.
*   **`sub_return_code`**: `integer`
    Mã lỗi chi tiết.
*   **`sub_return_message`**: `string`
    Thông báo lỗi chi tiết.
*   **`phone`**: `string`
    Số điện thoại của người dùng bị ẩn. Ví dụ: `****1234`.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "phone": "string"
}
```

## Lỗi thường gặp

- **access_token không hợp lệ hoặc hết hạn**
  * *Nguyên nhân:* `access_token` bị truyền sai hoặc người dùng đã hủy liên kết, dẫn đến token không còn hiệu lực.
  * *Cách fix:* Kiểm tra lại token lấy từ Merchant database, nếu người dùng đã hủy liên kết thì yêu cầu họ liên kết lại.
- **mac not equal**
  * *Nguyên nhân:* Sai thứ tự ghép chuỗi `hmacinput` (đúng là `app_id|access_token|req_date`) hoặc dùng sai khóa **key2** thay vì **key1**.
  * *Cách fix:* Sắp xếp chuỗi ghép đúng thứ tự `app_id|access_token|req_date` và ký bằng khóa **key1**.
- **Lệch múi giờ (req_date)**
  * *Nguyên nhân:* Giờ của máy chủ Merchant Server bị lệch quá 15 phút so với giờ máy chủ Zalopay.
  * *Cách fix:* Đồng bộ hóa giờ máy chủ Merchant Server bằng NTP.

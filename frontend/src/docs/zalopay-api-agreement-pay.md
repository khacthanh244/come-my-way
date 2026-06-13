---
api_name: Yêu cầu thanh toán hợp đồng
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-pay
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Yêu cầu thanh toán hợp đồng

API này được dùng để yêu cầu thanh toán (trừ tiền) tự động từ tài khoản người dùng sau khi đã thiết lập liên kết thành công (Agreement Binding). Được gọi từ phía Merchant Server sau khi có đơn hàng (được tạo qua API `create_order`).

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`identifier`**: `string` (required)
    Định danh của người dùng trên hệ thống của nhà cung cấp (merchant), có thể là mã người dùng, số điện thoại, địa chỉ email...
*   **`zp_trans_token`**: `string` (required)
    "Token" được tạo ra bởi API `create_order`.
*   **`pay_token`**: `string` (required)
    "Public token" của người thanh toán (nhận từ API liên kết hoặc truy vấn liên kết).
*   **`req_date`**: `int64` (required)
    Thời điểm hiện tại tính bằng mili giây (milliseconds).
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào như sau:
    `hmacinput = app_id + | + identifier + | + zp_trans_token + | + pay_token + | + req_date;`
    và sử dụng SHA256 với khóa HMAC của ứng dụng (`key1`) làm khóa chữ ký.

## MAC Formula

```text
hmacinput = app_id + "|" + identifier + "|" + zp_trans_token + "|" + pay_token + "|" + req_date;
```
*   **Thuật toán:** SHA256
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Mã trạng thái trả về:
    *   `1` - Thành công
    *   `2` - Thất bại
    *   `3` - Đang xử lý
*   **`return_message`**: `string`
    Mô tả mã trạng thái trả về.
*   **`sub_return_code`**: `integer`
    Mã lỗi chi tiết.
*   **`sub_return_message`**: `string`
    Thông báo lỗi chi tiết.
*   **`app_trans_id`**: `string`
    TXID (Transaction ID) của giao dịch đơn hàng.
*   **`zp_trans_id`**: `integer`
    Mã giao dịch của Zalopay.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "app_trans_id": "string",
  "zp_trans_id": 0
}
```

## Lỗi thường gặp

- **mac not equal**
  * *Nguyên nhân:* Sai thứ tự các trường trong công thức tạo MAC hoặc dùng nhầm **key2** (dùng để verify callback) thay vì **key1** (dùng để gửi request).
  * *Cách fix:* Kiểm tra lại chuỗi ghép `hmacinput` đúng thứ tự: `app_id|identifier|zp_trans_token|pay_token|req_date`, đảm bảo không chứa khoảng trắng thừa và dùng đúng **key1**.
- **Giao dịch đang xử lý (return_code = 3)**
  * *Nguyên nhân:* Hệ thống Zalopay đang xử lý thanh toán, hoặc đang chờ kết quả từ ngân hàng liên kết.
  * *Cách fix:* Không được báo lỗi thất bại ngay cho người dùng. Cần thiết lập cơ chế kiểm tra lại trạng thái giao dịch bằng API truy vấn đơn hàng hoặc chờ nhận callback kết quả từ Zalopay.
- **Pay token hết hạn hoặc không hợp lệ**
  * *Nguyên nhân:* Người dùng đã thực hiện hủy liên kết ví hoặc token bị sai sót trong quá trình truyền tải dữ liệu.
  * *Cách fix:* Yêu cầu người dùng thực hiện liên kết lại tài khoản ví để nhận `pay_token` mới trước khi thực hiện thanh toán.

---
api_name: Truy vấn số dư của một người dùng cụ thể trước khi thực hiện thanh toán
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-balance
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Truy vấn số dư của một người dùng cụ thể trước khi thực hiện thanh toán

Dùng để kiểm tra xem số dư tài khoản của người dùng có đủ để thực hiện giao dịch hay không trước khi thực hiện trừ tiền thực tế bằng API `agreement-pay`.

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`identifier`**: `string` (required)
    Định danh của người dùng trên hệ thống của nhà cung cấp (merchant), có thể là mã người dùng, số điện thoại, địa chỉ email...
*   **`pay_token`**: `string` (required)
    "Public token" của người thanh toán.
*   **`req_date`**: `int64` (required)
    Thời điểm hiện tại tính bằng mili giây (milliseconds).
*   **`amount`**: `int64` (required)
    Số tiền thanh toán.
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào như sau:
    `hmacinput = app_id + | + pay_token + | + identifier + | + amount + | + req_date;`
    và sử dụng SHA256 với khóa HMAC của ứng dụng làm khóa chữ ký.

## MAC Formula

```text
hmacinput = app_id + "|" + pay_token + "|" + identifier + "|" + amount + "|" + req_date;
```
*   **Thuật toán:** SHA256
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Các mã trạng thái trả về: 1: Thành công, nếu không thì thất bại.
*   **`return_message`**: `string`
    Mô tả trạng thái trả về.
*   **`sub_return_code`**: `integer`
    Mã trạng thái chi tiết.
*   **`sub_return_message`**: `string`
    Thông báo lỗi chi tiết.
*   **`data`**: `object[]` (array)
    Mảng danh sách các kênh thanh toán, mỗi item gồm:
    *   **`channel`**: `int64` - Kênh thanh toán.
    *   **`payable`**: `boolean` - Nếu người dùng có thể thanh toán thông qua kênh này.
    *   **`bank_code`**: `string` - Mã ngân hàng của kênh thanh toán.
*   **`discount_amount`**: `integer`
    Số tiền giảm giá của voucher tốt nhất của người dùng cho đơn hàng của nhà cung cấp. Nếu `discount_amount == 0` thì có nghĩa là người dùng không có voucher nào có thể áp dụng cho đơn hàng hiện tại.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "data": [
    {
      "channel": 0,
      "payable": true,
      "bank_code": "string"
    }
  ],
  "discount_amount": 0
}
```

## Lỗi thường gặp

- **Không đủ số dư để thực hiện giao dịch**
  * *Nguyên nhân:* Số tiền trong tài khoản ví hoặc thẻ liên kết của người dùng nhỏ hơn giá trị truyền vào ở trường `amount`.
  * *Cách fix:* Hiển thị thông báo hướng dẫn người dùng nạp thêm tiền vào ví Zalopay hoặc đổi nguồn tiền thanh toán khác.
- **mac not equal**
  * *Nguyên nhân:* Sai thứ tự các trường trong công thức tạo MAC. Lưu ý trường `amount` đứng trước `req_date`.
  * *Cách fix:* Kiểm tra lại chuỗi ghép `hmacinput` đúng thứ tự: `app_id|pay_token|identifier|amount|req_date` và dùng đúng khóa **key1**.
- **pay_token invalid / không tồn tại**
  * *Nguyên nhân:* Token thanh toán đã hết hạn, hoặc liên kết ví đã bị hủy từ phía người dùng.
  * *Cách fix:* Yêu cầu người dùng thực hiện liên kết lại ví để nhận token hợp lệ.

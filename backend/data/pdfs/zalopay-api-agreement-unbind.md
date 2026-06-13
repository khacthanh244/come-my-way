---
api_name: Hủy liên kết của hợp đồng đồng thuận
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-unbind
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Hủy liên kết của hợp đồng đồng thuận

API này dùng để hủy liên kết tự động trừ tiền giữa ví người dùng và Merchant khi người dùng yêu cầu hủy trên hệ thống của Merchant.

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`identifier`**: `string` (required)
    Định danh người dùng trên hệ thống của nhà cung cấp (merchant), có thể là mã người dùng của nhà cung cấp, số điện thoại, địa chỉ email...
*   **`binding_id`**: `string` (required)
    ID của liên kết mà người dùng muốn hủy liên kết.
*   **`req_date`**: `int64` (required)
    Thời điểm (timestamp) khi đơn hàng được tạo ra, tính bằng mili giây (ms). Giới hạn khác biệt là 15 phút.
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào như sau:
    `hmacinput = app_id + | + identifier + | + binding_id + | + req_date;`
    và sử dụng SHA256 với khóa HMAC của ứng dụng làm khóa chữ ký.

## MAC Formula

```text
hmacinput = app_id + "|" + identifier + "|" + binding_id + "|" + req_date;
```
*   **Thuật toán:** SHA256
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Mã trả về:
    *   `1` - Thành công
    *   `2` - Thất bại
*   **`return_message`**: `string`
    Mô tả trạng thái trả về.
*   **`sub_return_code`**: `integer`
    Mã trạng thái chi tiết.
*   **`sub_return_message`**: `string`
    Thông báo lỗi chi tiết.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string"
}
```

## Lỗi thường gặp

- **binding_id không tồn tại hoặc đã bị hủy**
  * *Nguyên nhân:* `binding_id` gửi lên không chính xác hoặc liên kết này đã được hủy trước đó trên hệ thống của Zalopay.
  * *Cách fix:* Kiểm tra lại lịch sử lưu trữ `binding_id` ở phía Merchant database và cập nhật trạng thái nếu đã hủy.
- **mac not equal**
  * *Nguyên nhân:* Sai thứ tự trường ghép chuỗi `hmacinput` hoặc dùng sai khóa **key2** thay vì **key1**.
  * *Cách fix:* Sắp xếp chuỗi ghép đúng thứ tự: `app_id|identifier|binding_id|req_date` và dùng khóa signature là **key1**.
- **Yêu cầu hết hạn (req_date chênh lệch quá 15 phút)**
  * *Nguyên nhân:* Giờ hệ thống (clock) của Merchant Server bị lệch so với thời gian thực tế của máy chủ Zalopay.
  * *Cách fix:* Đồng bộ hóa giờ trên Merchant Server bằng NTP (Network Time Protocol).

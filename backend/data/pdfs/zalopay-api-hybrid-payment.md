---
api_name: Yêu cầu thanh toán hợp đồng hoặc thanh toán một lần
source_url: https://docs.zalopay.vn/vi/docs/specs/hybrid-payment
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Yêu cầu thanh toán hợp đồng hoặc thanh toán một lần (Hybrid Payment)

API này hỗ trợ việc thực hiện thanh toán tự động qua hợp đồng (bằng token). Nếu thanh toán tự động thất bại hoặc không thể thực hiện, hệ thống sẽ trả về một `solution_url` để chuyển hướng người dùng thực hiện thanh toán một lần (One-time payment).

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int64` (required)
    ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`identifier`**: `string` (required)
    Định danh của người dùng trên hệ thống của nhà cung cấp (merchant), có thể là mã người dùng, số điện thoại, địa chỉ email...
*   **`pay_token`**: `string` (required)
    "Public token" của người thanh toán.
*   **`app_user`**: `string` (required)
    ID nhà cung cấp.
*   **`app_trans_id`**: `string` (required)
    ID giao dịch duy nhất của ứng dụng, định dạng: `yyMMddxxxxxxxxx`. Độ dài tối đa là 40 ký tự. Ví dụ: `180208181007242`.
*   **`app_time`**: `int64` (required)
    Thời điểm (timestamp) khi đơn hàng được tạo ra, tính bằng mili giây (ms). Giới hạn khác biệt là 15 phút.
*   **`amount`**: `int64` (required)
    Số tiền sẽ được tính phí (thanh toán).
*   **`description`**: `string` (required)
    Người dùng sẽ thấy văn bản này khi họ ở trong màn hình xác nhận thanh toán.
*   **`item`**: `string` (required)
    Chuỗi JSON mô tả các mục đơn hàng. Sử dụng `"[]"` nếu rỗng.
*   **`embed_data`**: `string` (required)
    Chuỗi JSON bao gồm thông tin đặc biệt của đơn hàng. Sử dụng `"{}"` nếu rỗng.
    *   *Các trường đặc biệt trong embed_data:*
        *   `preferred_payment_method` (array string): Dùng để hiển thị phương thức thanh toán tùy chọn (Ví dụ: `{"preferred_payment_method":["vietqr"]}`).
        *   `redirecturl` (string): URL để redirect về sau khi thanh toán xong trên cổng (Ví dụ: `{"redirecturl": "https://..."}`).
        *   `columninfo` (json string): Thêm thông tin hiển thị ở phần Quản lý giao dịch chi tiết trên Merchant site.
        *   `promotioninfo` (json string): Dùng để triển khai chương trình khuyến mãi (Ví dụ: `{"promotioninfo": "{\"campaigncode\":\"blackfriday\"}"}`).
        *   `zlppaymentid` (string): Mã thông tin thanh toán cho trường hợp đối soát về nhiều tài khoản khác nhau.
*   **`mac`**: `string` (required)
    Đây là chữ ký của đơn hàng. Nó được tính bằng cách sử dụng thông tin đầu vào.

## MAC Formula

```text
hmacinput = app_id + "|" + identifier + "|" + zp_trans_token + "|" + pay_token + "|" + req_date;
```
> **Note [typo trong docs gốc]:** Trong công thức tính MAC của tài liệu gốc viết là `hmacinput = app_id + "|" + identifier + "|" + zp_trans_token + "|" + pay_token + "|" + req_date;` nhưng ở request body của API này **KHÔNG HỀ CÓ** trường `zp_trans_token` lẫn `req_date` mà chỉ có `app_trans_id` và `app_time`.
> Thực tế, đây là lỗi copy-paste từ API `agreement-pay` của tài liệu gốc. Theo kinh nghiệm tích hợp, công thức MAC thực tế thường là:
> `hmacinput = app_id + "|" + identifier + "|" + app_trans_id + "|" + pay_token + "|" + amount + "|" + app_time;` hoặc tương đương.
> Merchant cần liên hệ trực tiếp với bộ phận kỹ thuật của ZaloPay để kiểm chứng lại chuỗi MAC cho API Hybrid Payment.

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
*   **`solution_url`**: `string`
    URL để chuyển hướng người dùng thanh toán One time payment khi thanh toán bằng token thất bại.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "app_trans_id": "string",
  "zp_trans_id": 0,
  "solution_url": "string"
}
```

## Lỗi thường gặp

- **mac not equal**
  * *Nguyên nhân:* Do lỗi copy-paste của docs gốc tạo nên sự mâu thuẫn về công thức MAC (chứa trường không gửi lên trong request).
  * *Cách fix:* Kiểm tra lại với hỗ trợ kỹ thuật của ZaloPay để lấy đúng công thức tạo MAC cho API này (thường sử dụng `app_trans_id` và `app_time` thay thế).
- **Không nhận được solution_url khi trừ tiền qua token thất bại**
  * *Nguyên nhân:* Do lỗi logic tạo link thanh toán One-time của hệ thống hoặc do các tham số trong `embed_data` (như `redirecturl`) bị lỗi định dạng.
  * *Cách fix:* Rà soát lại giá trị trả về `sub_return_code` để tìm nguyên nhân gốc rễ và kiểm tra định dạng các trường đặc biệt.
- **embed_data hoặc item sai định dạng JSON string**
  * *Nguyên nhân:* Truyền trực tiếp JSON object vào request body thay vì JSON string lồng.
  * *Cách fix:* Hãy parse các object này thành chuỗi string bằng `JSON.stringify(...)` trước khi truyền vào request.

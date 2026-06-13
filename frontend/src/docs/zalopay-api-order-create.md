---
api_name: Tạo đơn hàng
source_url: https://docs.zalopay.vn/vi/docs/specs/order-create
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Tạo đơn hàng

Merchant Server gửi thông tin đơn hàng tới Zalopay Server để tạo đơn hàng. Token (`zp_trans_token`) trả về sẽ được dùng để thực hiện thanh toán trực tiếp qua AppToApp hoặc dùng làm tham số cho các API Pay by Token.

> **Hỗ trợ:** `application/json`, `application/x-www-form-urlencoded`

## Request Body

*   **`app_id`**: `int32` (required)
    Định danh cho ứng dụng (web, app, pos ...) hay dịch vụ (auto-debit, disbursement ...) của Merchant được cấp khi đăng ký tích hợp phương thức thanh toán với Zalopay.
*   **`app_user`**: `string(50)` (required)
    Thông tin của người dùng thanh toán đơn hàng: id/username của user. Nếu không định danh được có thể dùng thông tin mặc định, chẳng hạn như tên ứng dụng và không được để trống.
*   **`app_trans_id`**: `string(40)` (required)
    Mã giao dịch Merchant gửi qua hệ thống Zalopay để user thực hiện thanh toán (TXID của giao dịch đơn hàng). Mã giao dịch phải bắt đầu theo format `yymmdd` của ngày hiện tại (múi giờ Việt Nam GMT+7). Ví dụ: `250210_OrderID`.
*   **`app_time`**: `int64` (required)
    Thời gian tạo đơn hàng (unix timestamp in millisecond). Lấy theo giờ hiện hành.
*   **`expire_duration_seconds`**: `long` (optional)
    Thời gian hết hạn của đơn hàng. Thời gian tính bằng giây (giá trị nhỏ nhất: 300, giá trị lớn nhất: 2592000).
*   **`amount`**: `int64` (required)
    Giá trị của đơn hàng.
*   **`description`**: `string(256)` (required)
    Thông tin mô tả về dịch vụ đang được thanh toán dùng để hiển thị cho user trên ứng dụng Zalopay và trên tool quản lý Merchant (mctool).
*   **`callback_url`**: `string` (optional)
    URL của Merchant nhận kết quả thông báo thanh toán (callback server-to-server) khi giao dịch thành công.
*   **`sub_app_id`**: `string(50)` (optional)
    Định danh dịch vụ/nhóm dịch vụ sử dụng thanh toán trên ứng dụng của Merchant.
*   **`item`**: `string(2048)` (required)
    Mảng JSON mô tả các mục đơn hàng. Sử dụng `"[]"` nếu rỗng.
*   **`embed_data`**: `string(2048)` (required)
    Chuỗi JSON bao gồm thông tin đặc biệt của đơn hàng. Sử dụng `"{}"` nếu rỗng.
    *   *Các trường đặc biệt trong embed_data:*
        *   `preferred_payment_method` (Array string): Phương thức thanh toán tùy chọn (Ví dụ: `["domestic_card", "vietqr"]`).
        *   `redirecturl` (string): URL redirect về sau khi thanh toán trên cổng (Ví dụ: `{"redirecturl": "https://..."}`).
        *   `columninfo` (JSON string): Thêm thông tin hiển thị ở phần Quản lý giao dịch chi tiết trên Merchant tool.
        *   `zlppaymentid` (string): Mã thông tin thanh toán phục vụ đối soát đa tài khoản.
*   **`bank_code`**: `string` (optional)
    Chỉ áp dụng trong trường hợp thanh toán online.
*   **`mac`**: `string` (required)
    Thông tin chứng thực.

## MAC Formula

```text
hmac_input = app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item;
```
*   **Thuật toán:** HmacSHA256 (mặc định) hoặc theo phương thức Merchant đăng ký với Zalopay.
*   **Khóa:** Khóa HMAC của ứng dụng (**key1**) được Zalopay cung cấp.

## Response

Đối chiếu từ Response Schema và Response Example:

*   **`return_code`**: `integer`
    Mã trạng thái giao dịch (1: Thành công, các mã khác là thất bại).
*   **`return_message`**: `string`
    Mô tả mã trạng thái.
*   **`sub_return_code`**: `integer`
    Mã trạng thái chi tiết.
*   **`sub_return_message`**: `string`
    Mô tả mã trạng thái chi tiết.
*   **`zp_trans_token`**: `string`
    Token của giao dịch. Dùng để mở ứng dụng Zalopay trên thiết bị của người dùng (AppToApp) hoặc làm input gọi API Pay by token.
*   **`order_token`**: `string`
    Token của đơn hàng.
*   **`order_url`**: `string`
    Dùng để chuyển tiếp người dùng đến trang thanh toán trên Cổng Zalopay.
*   **`qr_code`**: `string`
    Dùng để tạo Zalopay QR đa năng hiển thị trên ứng dụng bán hàng của Doanh nghiệp.

### Response Example
```json
{
  "return_code": 1,
  "return_message": "string",
  "sub_return_code": 0,
  "sub_return_message": "string",
  "zp_trans_token": "string",
  "order_token": "string",
  "order_url": "string",
  "qr_code": "string"
}
```

## Lỗi thường gặp

- **app_trans_id không hợp lệ (lỗi format ngày)**
  * *Nguyên nhân:* `app_trans_id` không bắt đầu bằng `yymmdd` đúng với ngày hiện tại (theo múi giờ Việt Nam GMT+7).
  * *Cách fix:* Đảm bảo tiền tố `yymmdd` trùng khớp hoàn toàn với ngày hiện hành của Việt Nam (ví dụ ngày 10/06/2026 thì tiền tố là `260610`).
- **mac not equal**
  * *Nguyên nhân:* Ghép sai chuỗi `hmac_input`, hoặc chuỗi `embed_data`/`item` khi tính MAC khác với chuỗi gửi đi trong request body (ví dụ do khác biệt về khoảng trắng hoặc thứ tự key).
  * *Cách fix:* Hãy stringify `embed_data` và `item` thành JSON string một lần duy nhất, dùng chính chuỗi đó để tạo MAC và gán vào request body.
- **Lỗi chênh lệch thời gian (app_time)**
  * *Nguyên nhân:* `app_time` truyền lên chênh lệch quá 15 phút so với giờ hệ thống của Zalopay Server.
  * *Cách fix:* Đồng bộ hóa đồng hồ hệ thống Merchant Server bằng NTP.

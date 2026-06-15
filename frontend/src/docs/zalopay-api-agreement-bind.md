---
api_name: Tạo một liên kết mới cho hợp đồng đồng thuận
source_url: https://docs.zalopay.vn/vi/docs/specs/agreement-bind
fetch_date: 2026-06-10
flow: Agreement Pay
---

# Tạo một liên kết mới cho hợp đồng đồng thuận

API này dùng để thiết lập một liên kết (binding) mới giữa tài khoản ví Zalopay của người dùng và hệ thống của nhà cung cấp (merchant). Đây là bước đầu tiên trong luồng thanh toán tự động (Agreement Pay / Auto-debit), cho phép người dùng thực hiện uỷ quyền thanh toán để merchant có thể tự động trừ tiền trong tài khoản ví của họ ở các giao dịch tiếp theo mà không cần người dùng phải xác nhận lại.

> **Hỗ trợ:** `application/json`, `application/xml`, `application/x-www-form-urlencoded` (Dưới đây chỉ hiển thị 1 bản đại diện áp dụng chung).

---

## Request Body

*   **`app_id`** (required | `int64`): ID duy nhất của ứng dụng sẽ được cung cấp sau khi nhà cung cấp đăng ký thành công với Zalopay.
*   **`app_trans_id`** (required | `string`): ID giao dịch duy nhất của ứng dụng, định dạng: `yyMMddxxxxxxxxx`. Độ dài tối đa là 40 ký tự. Ví dụ: `180208181007242`.
*   **`req_date`** (required | `int64`): Thời điểm (timestamp) khi đơn hàng được tạo ra, tính bằng mili giây (ms). Giới hạn chênh lệch thời gian cho phép tối đa là 15 phút.
*   **`max_amount`** (optional | `int64`): Số tiền tối đa được phép. Giá trị mặc định là số dư thực.
*   **`redirect_url`** (optional | `string`): URL của trang liên kết của nhà cung cấp (web), được sử dụng trong kịch bản liên kết trên desktop. Sau khi quá trình liên kết hoàn tất, trang tự động nạp tiền Zalopay sẽ chuyển hướng đến trang liên kết của nhà cung cấp thông qua URL chuyển hướng này kèm theo kết quả liên kết.
*   **`redirect_deep_link`** (optional | `string`): Đường dẫn sâu (deep-link) của ứng dụng nhà cung cấp, được sử dụng trong kịch bản liên kết trên điện thoại di động. Sau khi quá trình liên kết hoàn tất, ứng dụng Zalopay sẽ mở ứng dụng nhà cung cấp thông qua đường dẫn sâu chuyển hướng (redirect deep link) với kết quả liên kết.
*   **`binding_data`** (optional | `string`): Chuỗi JSON chứa thông tin liên kết (binding), mô tả thông tin mà người dùng sẽ đồng ý cho phép nhà cung cấp (merchant) thực hiện bằng việc xác nhận liên kết.
    > *Lưu ý:* Đây là **JSON string lồng trong JSON**. Merchant cần serialize object này thành dạng string trước khi đưa vào JSON request body.
*   **`binding_type`** (optional | `string`): Trường này xác định loại liên kết (binding), hiện tại chỉ cho phép loại liên kết là `WALLET`. Nếu không được cung cấp, giá trị mặc định là `WALLET`. Các giá trị khả dụng: [`WALLET`].
*   **`callback_url`** (optional | `string`): URL nhận kết quả callback từ Zalopay sau khi người dùng liên kết thành công. (Docs ghi chú: TBD).
*   **`identifier`** (required | `string`): Định danh người dùng trên hệ thống của nhà cung cấp (merchant), có thể là mã người dùng của nhà cung cấp, số điện thoại, địa chỉ email...
*   **`mac`** (required | `string`): Chữ ký bảo mật (signature) của request để đảm bảo tính toàn vẹn của dữ liệu.

---

## MAC Formula

Công thức tạo chữ ký MAC (sử dụng thuật toán HMAC-SHA256 với khóa bí mật **key1** của Merchant):

`hmacinput = app_id + | + apps_trans_id + | + binding_data + | + binding_type + | + identifier + | + max_amount + | + req_date;`

> **[!NOTE]**
> *   **[Typo trong docs gốc]**: Trong công thức MAC của tài liệu gốc, tên trường được ghi là `apps_trans_id` (có chữ 's') thay vì đúng chuẩn của request body là `app_trans_id`. Khi thực hiện tính toán, cần kiểm tra thực tế xem hệ thống Zalopay nhận chuỗi hash nào (thường Merchant cần map chính xác giá trị của `app_trans_id` vào vị trí của biến này khi nối chuỗi).
> *   Sử dụng **key1** được cấp trong Merchant Portal làm khoá ký chữ ký (sign key).

---

## Response (200 OK)

*   **`return_code`** (`integer`): Mã trả về kết quả liên kết.
    *   `1` - SUCCESS (Giao dịch thành công)
    *   `2` - FAIL (Giao dịch thất bại)
    *   `3` - PROCESSING (Đang xử lý)
    *   `-500` - SYSTEM_ERROR (Lỗi hệ thống Zalopay)
    *   `-429` - LIMIT_REQUEST_REACH (Vượt quá giới hạn request cho phép)
    *   `406` - ILLEGAL_STATUS (Trạng thái không hợp lệ)
    *   `-405` - ILLEGAL_CLIENT_REQUEST (Yêu cầu từ client không hợp lệ)
    *   `-403` - ILLEGAL_SIGNATURE_REQUEST (Chữ ký MAC không hợp lệ)
    *   `-402` - ILLEGAL_APP_REQUEST (Ứng dụng yêu cầu không hợp lệ)
    *   `-401` - ILLEGAL_DATA_REQUEST (Dữ liệu yêu cầu không hợp lệ)
    *(Lưu ý: Trong phần Example của docs gốc, giá trị return_code mẫu trả về có thể là `0` - Merchant nên xử lý linh hoạt hoặc dựa vào giá trị trả về thực tế).*
*   **`return_message`** (`string`): Thông báo kết quả chi tiết đi kèm.
*   **`sub_return_code`** (`integer`): Mã lỗi phụ chi tiết từ hệ thống.
*   **`sub_return_message`** (`string`): Thông báo lỗi phụ chi tiết.
*   **`binding_id`** (`string`): Mã liên kết duy nhất được tạo ra từ hệ thống Zalopay nếu giao dịch liên kết thành công.
*   **`binding_url`** (`string`): URL dẫn đến trang liên kết của Zalopay để Merchant điều hướng người dùng sang thực hiện xác nhận liên kết.

---

## Lỗi thường gặp với API này

*   **Lỗi `-403` (mac not equal / ILLEGAL_SIGNATURE_REQUEST)**
    *   *Nguyên nhân:* Sai thứ tự các trường khi nối chuỗi MAC, sử dụng sai HMAC key (ví dụ: dùng nhầm `key2` để tạo MAC thay vì `key1`), hoặc lỗi format do truyền dữ liệu JSON lồng của trường `binding_data` không khớp giữa chuỗi lúc hash và chuỗi lúc gửi request.
    *   *Cách fix:* Kiểm tra lại thứ tự ghép chuỗi theo đúng tài liệu. Đảm bảo dùng **key1** để tạo mã hash HMAC-SHA256. Đảm bảo chuỗi `binding_data` sau khi được stringify phải đồng nhất 100% về mặt ký tự (bao gồm cả khoảng trắng, ký tự escape nếu có) giữa lúc tính MAC và lúc đưa vào JSON payload gửi đi.
*   **Lỗi `-401` (binding hết hạn / ILLEGAL_DATA_REQUEST)**
    *   *Nguyên nhân:* Tham số `req_date` (timestamp tính bằng ms) gửi lên bị lệch quá 15 phút so với giờ chuẩn của máy chủ Zalopay, hoặc liên kết bị treo quá 15 phút kể từ lúc khởi tạo mà người dùng không xác nhận trên ứng dụng Zalopay.
    *   *Cách fix:* Cấu hình đồng bộ thời gian (NTP) cho server của Merchant. Trường hợp liên kết hết hạn do người dùng thao tác chậm, cần huỷ request cũ và tạo lại request liên kết mới với `app_trans_id` mới và `req_date` mới.
*   **Merchant không nhận được kết quả liên kết thông qua Callback**
    *   *Nguyên nhân:* Tham số `callback_url` không phải là URL public (ví dụ: cấu hình `localhost` hoặc mạng nội bộ), hệ thống firewall của Merchant chặn kết nối từ dải IP của Zalopay, hoặc Merchant verify chữ ký callback thất bại do sử dụng sai key.
    *   *Cách fix:* Cấu hình `callback_url` trỏ đến một địa chỉ HTTPS public có thể truy cập được từ internet. Đảm bảo mở firewall cho các IP từ Zalopay. Khi nhận dữ liệu callback từ Zalopay, Merchant bắt buộc phải sử dụng **key2** để verify chữ ký MAC đi kèm.

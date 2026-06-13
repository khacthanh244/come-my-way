# Zalopay Box V5 — Hướng dẫn tích hợp và sử dụng

> **Nguồn:** Tài liệu tích hợp chính thức Zalopay Box V5  
> **Mục đích:** Knowledge base cho AI Agent hỗ trợ merchant cài đặt và sử dụng thiết bị Zalopay Box (loa chuyển khoản)  
> **Phiên bản:** V5

---

## Mục lục

1. [Zalopay Box là gì?](#zalopay-box-là-gì)
2. [Hình ảnh và các nút chức năng](#hình-ảnh-và-các-nút-chức-năng)
3. [Kết nối internet](#kết-nối-internet)
4. [Kết nối thiết bị với máy POS để hiển thị QR thanh toán](#kết-nối-với-máy-pos)

---

## Zalopay Box là gì?

Zalopay Box là thiết bị kết hợp **loa thông báo thanh toán** và **màn hình hiển thị mã QR** (Zalopay QR / Zalopay QR đa năng / VietQR) đặt tại quầy thu ngân của merchant.

Zalopay Box kết nối với máy POS tại cửa hàng. Khi máy POS tạo đơn hàng qua API, Zalopay Box sẽ tự động hiển thị mã QR tương ứng để khách hàng quét và thanh toán — đồng thời phát thông báo âm thanh khi giao dịch hoàn tất.

---

## Hình ảnh và các nút chức năng

Thiết bị Zalopay Box có **mặt trước** (màn hình hiển thị QR và thông tin thanh toán) và **mặt sau** (lưới loa, khe SIM, các nút vật lý).

### Bảng chức năng các nút

| Nút chức năng | Thao tác nhấn một lần | Thao tác nhấn và giữ |
|--------------|----------------------|---------------------|
| Nút (+) — Tăng âm lượng | Tăng âm lượng | Chuyển đổi chế độ mạng Wifi/4G |
| Nút (−) — Giảm âm lượng | Giảm âm lượng | Chuyển đổi giữa giọng miền Nam và miền Bắc |
| Nút chức năng (giữa) | Đọc lại các giao dịch gần đây | Chế độ cấu hình kết nối Wifi cho thiết bị *(dùng để thực hiện Bước 3 trong mục Kết nối Wi-Fi)* |
| Nút nguồn | Kiểm tra chất lượng mạng và thời lượng pin | Bật/tắt thiết bị |

---

## Kết nối internet

Zalopay Box hỗ trợ 2 loại kết nối: **Wi-Fi** và **4G (SIM)**.

---

### Kết nối Wi-Fi

**Bước 1:** Nhấn và giữ nút nguồn để bật thiết bị.

**Bước 2:** Nhấn và giữ nút **(+)** cho đến khi loa thông báo: *"Chuyển sang mạng Wi-Fi"*.

**Bước 3:** Nhấn và giữ **nút chức năng (giữa)** cho đến khi loa phát thông báo: *"Chế độ cấu hình Wi-Fi"*.

**Bước 4:** Mở điện thoại di động, kết nối với mạng Wi-Fi có tên:

```
Zalopay Box XXXXXX
```

> Trong đó `XXXXXX` là **Serial Number** của thiết bị Zalopay Box (ví dụ: `Zalopay Box V52016`).

Điện thoại sẽ tự động mở trình duyệt (Safari trên iOS / trình duyệt mặc định trên Android) và điều hướng đến địa chỉ `192.168.1.1` để thực hiện cài đặt Wi-Fi.

#### Chi tiết các bước thực hiện (ví dụ thiết bị có Serial Number V52016)

| Bước | Thao tác |
|------|---------|
| 1 | Chọn Wi-Fi **"Zalopay Box V52016"** trên điện thoại di động |
| 2 | Sau khi kết nối thành công, màn hình sẽ hiển thị giao diện **"Cài đặt Wifi loa Zalopay V5"** với danh sách các Wi-Fi để chọn kết nối Internet |
| 3 | Chọn mạng Wi-Fi cần kết nối Internet từ danh sách (hoặc nhập tên SSID thủ công) |
| 4 | Nhập mật khẩu Wi-Fi đã chọn, sau đó nhấn **"Kết nối"** |
| 5 | Đợi thiết bị xác nhận kết quả. Nếu không thành công, thử lại hoặc gọi **1900 545436** để được hỗ trợ |

> **Lưu ý:** Sau khi nhấn "Kết nối", trang sẽ đóng trong vài giây. Thiết bị sẽ phát thông báo xác nhận kết quả kết nối.

---

### Kết nối 4G (SIM)

**Bước 1:** Lắp thẻ **SIM 4G** vào khe SIM theo đúng chiều mũi tên được hướng dẫn trên thiết bị.

**Bước 2:** Thiết bị sẽ tự động tiến hành kết nối. Chờ cho đến khi thiết bị phát thông báo:

> *"Kết nối máy chủ thành công"*

Thông báo này xác nhận thiết bị đã kết nối 4G thành công.

#### Chuyển đổi giữa Wi-Fi và 4G

Nhấn và giữ **nút (+)** để chuyển đổi chế độ mạng giữa Wi-Fi và 4G.

---

## Kết nối với máy POS

Zalopay Box kết hợp với máy POS đặt tại quầy thu ngân. Khi máy POS tạo đơn hàng qua API, Zalopay Box sẽ tự động nhận lệnh và hiển thị mã QR thanh toán tương ứng.

### Bước 1: Khai báo Chi nhánh, Cửa hàng, Quầy trên mctool

Merchant cần khai báo cấu trúc tổ chức trước khi kết nối:

```
Chi nhánh (Branch) → Cửa hàng (Store) → Quầy (Counter) → Máy POS
```

Thực hiện khai báo tại **mctool** (Merchant Tool):

| Cấp độ | Thông tin cần khai báo |
|--------|----------------------|
| Chi nhánh | Mã chi nhánh, Tên chi nhánh, Thời gian mở/đóng cửa, Địa chỉ |
| Cửa hàng | Mã cửa hàng Zalopay, Mã cửa hàng Merchant, Tên cửa hàng, Địa chỉ |
| Quầy | Mã quầy, Tên quầy |

**Ví dụ khai báo:**

- Chi nhánh: Mã `67283`, Tên "Chi nhánh Thủ Đức", địa chỉ 28 Võ Tùng Phan, An Phú, TP. Thủ Đức
- Cửa hàng: Mã Zalopay `67283_67284`, Mã Merchant `TD_001`, Tên "Linh Trung", KCN Linh Trung
- Quầy: Mã `67283_67284_67773`, Tên "Quầy thu ngân 01"

### Bước 2: Truyền tham số `store_id` và `pos_id` khi tạo đơn hàng

Khi gọi **API Create Order**, merchant cần truyền thêm 2 tham số vào trường `columninfo` bên trong `embed_data`:

| Tham số | Mô tả | Nguồn |
|---------|-------|-------|
| `store_id` | Mã cửa hàng Merchant | Khai báo trên mctool |
| `pos_id` | Mã máy POS tại Quầy trong Cửa hàng | Do merchant tự định nghĩa |

> **Lưu ý kỹ thuật:**
> - Kiểu dữ liệu của `embed_data` và `columninfo` đều là **JSON String**
> - `columninfo` là trường dữ liệu **nằm trong** `embed_data`

#### Ví dụ cụ thể

**Tình huống:** Máy POS đặt tại Quầy thu ngân 01, cửa hàng Linh Trung, có `pos_id = POS001`.

**Giá trị `columninfo` cần truyền:**

```json
"columninfo": "{\"store_id\": \"TD_001\",\"pos_id\":\"POS001\"}"
```

**Ví dụ đầy đủ trong `embed_data` của Create Order request:**

```json
{
  "app_id": "123015",
  "app_trans_id": "231227_123015_1703664997117",
  "app_user": "demo",
  "amount": 25000,
  "description": "Thanh toán đơn hàng",
  "embed_data": "{\"preferred_payment_method\": [\"vietqr\"], \"columninfo\": \"{\\\"store_id\\\": \\\"TD_001\\\",\\\"pos_id\\\":\\\"POS001\\\"}\"}",
  "item": "[]",
  "mac": "..."
}
```

### Kết quả hiển thị trên thiết bị Zalopay Box

| Trạng thái | Hiển thị trên màn hình |
|-----------|----------------------|
| **Tạo đơn hàng thành công** | Màn hình hiển thị mã QR đa năng kèm số tiền (ví dụ: 25000 VND), thông tin merchant, và logo ZLP |
| **Thanh toán thành công** | Màn hình hiển thị dấu tick xanh, chữ *"Thanh toán thành công. Cảm ơn quý khách!"*, đồng thời loa phát thông báo âm thanh |

---

## Tóm tắt nhanh — Checklist kích hoạt Zalopay Box

Để Zalopay Box hoạt động đầy đủ, merchant cần hoàn thành các bước sau:

**Phần cứng:**
- Bật thiết bị (nhấn giữ nút nguồn)
- Kết nối internet: Wi-Fi hoặc lắp SIM 4G
- Xác nhận loa phát thông báo *"Kết nối máy chủ thành công"*

**Phần mềm / Cấu hình:**
- Khai báo Chi nhánh, Cửa hàng, Quầy trên mctool
- Xác định `pos_id` cho từng máy POS tại từng Quầy
- Cập nhật code tạo đơn hàng: thêm `store_id` và `pos_id` vào `columninfo` trong `embed_data`

**Kiểm tra:**
- Tạo thử một đơn hàng từ máy POS
- Xác nhận mã QR hiển thị đúng trên màn hình Zalopay Box
- Xác nhận loa phát thông báo sau khi thanh toán thành công

---

## Liên hệ hỗ trợ

Hotline: **1900 545436**  
Email: **hotro@zalopay.vn**

---

*Knowledge base này được tạo từ tài liệu tích hợp chính thức Zalopay Box V5 và được tối ưu hóa cho AI Agent hỗ trợ merchant cài đặt và sử dụng thiết bị Zalopay Box (loa chuyển khoản QR đa năng).*

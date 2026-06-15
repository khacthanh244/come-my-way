# Zalopay — Knowledge Base Giải Pháp Thanh Toán (Merchant)

> Tài liệu này dành cho **Merchant path** — giải thích sản phẩm, so sánh giải pháp, gợi ý combo.
> Không chứa chi tiết kỹ thuật API. Thông tin kỹ thuật xem trong integration docs riêng.

---

## 1. PAYMENT GATEWAY

**Mô tả:** Tích hợp một lần để nhận thanh toán qua đầy đủ kênh — ví Zalopay, QR ngân hàng, thẻ ATM, thẻ quốc tế. Khi khách chọn thanh toán, hệ thống Zalopay xử lý toàn bộ trên trang của mình; doanh nghiệp nhận kết quả về tự động.

**Phù hợp với:**
- Doanh nghiệp bán hàng online (website, app)
- Muốn hỗ trợ đa phương thức mà không tự xây dựng giao diện thanh toán
- Muốn triển khai nhanh, ít tốn công kỹ thuật nhất

**Luồng hoạt động đơn giản:**
Khách chọn thanh toán → Doanh nghiệp tạo đơn hàng → Zalopay hiển thị trang thanh toán → Khách hoàn tất → Doanh nghiệp nhận kết quả về tự động

**Phương thức thanh toán hỗ trợ:** Ví Zalopay, QR ngân hàng (VietQR), thẻ ATM nội địa, thẻ quốc tế (Visa/Mastercard/JCB)

---

## 2. VIETQR (ZALOPAY QR ĐA NĂNG)

**Mô tả:** Mã QR đa năng hiển thị trực tiếp trên hệ thống của doanh nghiệp — khách hàng quét bằng ứng dụng bất kỳ ngân hàng nào (hơn 40 ngân hàng NAPAS) hoặc Zalopay để thanh toán, không cần rời khỏi trang.

**Phù hợp với:**
- Đối tác muốn khách thanh toán ngay trên giao diện của mình, không chuyển sang trang Zalopay
- Màn hình POS tại quầy cần hiển thị QR khác nhau theo từng đơn hàng
- App mobile muốn cho phép khách mở thẳng ứng dụng ngân hàng để thanh toán

**3 hình thức triển khai:**

**(A) Redirect Gateway:** Zalopay tự hiển thị QR trên trang của mình. Phù hợp khi muốn đơn giản, không tự render.

**(B) Hiển thị QR trực tiếp:** Doanh nghiệp tự hiển thị mã QR ngay trong hệ thống của mình — trên website, app, hoặc màn hình POS. Khách dùng bất kỳ app ngân hàng nào để quét.

**(C) Deeplink ngân hàng:** Khi khách dùng app mobile, có thể mở thẳng ứng dụng ngân hàng của họ để thanh toán mà không cần quét QR thủ công.

**Khác biệt so với Payment Gateway:**
- Gateway: Zalopay xử lý toàn bộ trang thanh toán, khách rời khỏi trang của doanh nghiệp
- VietQR: QR hiển thị ngay trên trang của doanh nghiệp, khách không đi đâu cả

---

## 3. ZALOPAY BOX (LOA CHUYỂN KHOẢN)

**Mô tả:** Thiết bị đặt tại quầy thu ngân gồm màn hình hiển thị QR và loa thông báo — tự động hiển thị mã QR theo từng đơn hàng từ máy POS và phát thông báo âm thanh ngay khi khách thanh toán thành công. Nhân viên thu ngân không cần thao tác thêm bất kỳ bước nào.

**Phù hợp với:**
- Cửa hàng, quán ăn, nhà hàng, tiệm bán lẻ có quầy thu ngân vật lý
- Hệ thống máy POS đang có, muốn thêm thông báo thanh toán tự động

**Kết nối internet:** Hỗ trợ Wi-Fi và SIM 4G, chuyển đổi bằng nút vật lý trên thiết bị.

**Để sử dụng, cần hoàn thành 2 phần:**

**Phần 1 — Kết nối thiết bị:**
- Bật thiết bị và kết nối internet (Wi-Fi hoặc SIM 4G)
- Xác nhận thiết bị phát thông báo *"Kết nối máy chủ thành công"*

**Phần 2 — Cấu hình hệ thống:**
- Khai báo cấu trúc Chi nhánh / Cửa hàng / Quầy trên **mctool** (Merchant Tool của Zalopay)
- Kết nối máy POS với thiết bị qua API của Zalopay

**Kết quả sau khi cài đặt:**
- Khi máy POS tạo đơn hàng → màn hình Zalopay Box hiển thị QR tự động kèm số tiền
- Khách quét QR thanh toán → loa phát thông báo xác nhận ngay lập tức

**Hotline hỗ trợ cài đặt:** 1900 545436

---

## 4. AGREEMENT PAY (THU TIỀN ĐỊNH KỲ)

**Mô tả:** Khách hàng xác nhận thỏa thuận một lần — doanh nghiệp chủ động thu tiền vào các kỳ tiếp theo mà không cần khách thao tác lại.

> 🎬 **Xem minh họa cách hoạt động:** [Video ngắn Agreement Pay](https://youtube.com/shorts/RydeEduXSfo?si=cqMeeNI0d_hKOX8l)

**Phù hợp với:**
- Dịch vụ thu phí định kỳ: hội viên, thuê bao, bảo hiểm
- Nạp tiền tự động theo hạn mức
- Trả góp hoặc thu phí phát sinh theo thỏa thuận có trước với khách

**Khác với thanh toán thông thường:**
- Thanh toán thông thường: khách xác nhận mỗi lần giao dịch
- Agreement Pay: khách xác nhận một lần, doanh nghiệp chủ động thu các kỳ sau theo lịch hoặc khi phát sinh

**Lưu ý:** Agreement Pay yêu cầu tích hợp kỹ thuật để quản lý thỏa thuận. Nếu doanh nghiệp chưa có đội kỹ thuật, có thể liên hệ Zalopay để được tư vấn thêm về hướng triển khai phù hợp.

---

## 5. SO SÁNH NHANH 4 GIẢI PHÁP

| Tiêu chí | Payment Gateway | VietQR | Zalopay Box | Agreement Pay |
|----------|----------------|--------|-------------|---------------|
| Kênh bán hàng | Online | Online + Offline | Offline | Online |
| Trải nghiệm khách | Thanh toán tại trang Zalopay | Quét QR ngay trên trang | Quét QR tại quầy | Đồng ý 1 lần, tự động các lần sau |
| Cần thiết bị | Không | Không | Có (loa + màn hình) | Không |
| Phương thức hỗ trợ | ATM, thẻ quốc tế, QR, ví | 40+ ngân hàng + Zalopay | 40+ ngân hàng + Zalopay | Ví Zalopay |
| Phù hợp nhất | Website/app cần đa phương thức | Tích hợp QR vào hệ thống sẵn có | Quầy thu ngân vật lý | Thu phí định kỳ |

---

## 6. COMBO GIẢI PHÁP PHỔ BIẾN

### Online + Offline
Chuỗi cửa hàng có website và điểm bán vật lý:
→ **Payment Gateway** (kênh online) + **Zalopay Box** (quầy thu ngân)

### Website muốn giữ khách trên trang
Không muốn redirect sang trang Zalopay:
→ **VietQR** hiển thị QR ngay trên giao diện của doanh nghiệp

### Dịch vụ định kỳ + đơn lẻ
Vừa có đơn hàng thông thường vừa có gói hội viên:
→ **Payment Gateway** (đơn hàng thông thường) + **Agreement Pay** (thu định kỳ)

### Chuỗi F&B / bán lẻ có POS
Hệ thống POS đang có, muốn thêm thông báo thanh toán:
→ **Zalopay Box** kết nối vào POS hiện tại — không cần thay đổi hệ thống

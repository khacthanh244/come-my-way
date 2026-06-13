# ZaloPay Design System — Frontend Rule

Quy tắc bắt buộc khi viết/refactor UI trong `frontend/`. Tham chiếu từ
`ZaloPay_Technical_Implementation_Guide.md`. Mọi component mới phải tuân thủ.

## 1. Color tokens (định nghĩa trong `src/index.css` qua `@theme`)

Dùng **token Tailwind**, KHÔNG hardcode hex (`bg-[#0068ff]` → `bg-blue-1000`).

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `blue-1000` | `#0033C9` | **Primary** — button chính, header, link, icon nhấn mạnh |
| `blue-900` | `#0028A3` | Hover của primary |
| `green-1300` | `#00CF6A` | Wealth green — sản phẩm đầu tư / tiết kiệm, trạng thái success, chữ "pay" của logo |
| `dark-500` | `#001F3E` | Tiêu đề chính (+ `font-bold`) |
| `dark-300` | `#66798B` | Nội dung phụ / caption |
| `dark-200` | `#99A5B2` | Border / divider |
| `divider` | `#EEF4FE` | Divider nền nhạt |
| `app` | `#F5F9FF` | Nền app chung (`body`) |

Phụ: scale Tailwind mặc định (`blue-50`, `gray-*`, `emerald-*`) được phép dùng cho nền/hover nhạt.

## 2. Typography

- **Title:** `text-[16px] font-bold leading-5` (mobile) / lớn hơn cho landing.
- **Body:** `text-[14px] leading-snug`.
- **Caption:** `text-[12px] text-dark-300`.
- **Font:** `Inter` / `Roboto` (đã set ở `body`), fallback `system-ui`.
- Giá trị quan trọng (lãi suất, lợi nhuận): in đậm, `text-blue-1000` hoặc `text-green-1300`.

## 3. Layout & Spacing

- **Container padding:** `px-4` (mobile), `px-6`+ cho trang rộng.
- **Section gap:** `gap-3` (12px) hoặc `gap-4` (16px).
- **Border radius:** thẻ chính `rounded-xl` (12px); button/input `rounded-[8px]`.
- **Icon:** SVG `viewBox="0 0 16 16"` hoặc `24 24`, màu mặc định `text-dark-200`.

## 4. Component recipes

**Card**
```html
<div class="bg-white rounded-xl shadow-sm overflow-hidden border border-divider">
  <div class="bg-blue-1000 px-3 pt-2 pb-1 text-white text-[14px] font-bold">Tiêu đề</div>
  <div class="p-4">
    <p class="text-[14px] text-dark-500">Nội dung…</p>
    <button class="mt-4 bg-blue-1000 text-white rounded-[8px] px-6 py-2 text-[14px] font-bold active:scale-95 transition-transform">Xác nhận</button>
  </div>
</div>
```

**Input**
```html
<div class="px-4 py-2 bg-white rounded-[8px] border border-dark-200 focus-within:border-blue-1000">
  <label class="block text-[12px] text-dark-300">Họ và tên</label>
  <input class="w-full bg-transparent text-[16px] text-dark-500 outline-none" placeholder="Nhập tên của bạn">
</div>
```

**Primary button:** `bg-blue-1000 text-white rounded-[8px] font-bold hover:bg-blue-900 active:scale-95 transition`.

## 5. Logo

Luôn dùng component `ZaloPayLogo` (`src/components/ZaloPayLogo.tsx`) — KHÔNG viết
lại inline. "Zalo" màu `blue-1000`, "pay" màu `green-1300`.

## 6. Sản phẩm Wealth (đầu tư / bảo hiểm)

Chủ đạo tông xanh ngọc (`green-1300`) thay vì xanh dương để tạo cảm giác an tâm,
sinh lời. Số liệu nổi bật, in đậm, `text-green-1300`.

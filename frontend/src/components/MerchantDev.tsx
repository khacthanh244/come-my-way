import { useState } from 'react'
import { ChatOverlay } from './ChatOverlay'
import { ZaloPayLogo } from './ZaloPayLogo'
import { useChat } from '../hooks/useChat'

const NAV = [
  { label: 'BẮT ĐẦU', dropdown: false },
  { label: 'DANH SÁCH API', dropdown: false },
  { label: 'GIẢI PHÁP THANH TOÁN', dropdown: true },
  { label: 'MÔ HÌNH TÍCH HỢP', dropdown: true },
  { label: 'REFERENCE', dropdown: true },
]

const HERO_TILES = [
  'Thanh toán Zalopay QR đa năng',
  'Thanh toán QR',
  'App to App',
  'Mobile Web to App',
  'Cổng Zalopay',
  'QuickPay',
  'Web in app',
  'QR tĩnh tại quầy',
  'Tích hợp cổng Zalopay trên Shopify',
]

const SOLUTIONS = [
  { title: 'Thanh toán QR', icon: '📱', color: 'text-blue-1000', desc: 'Dùng app Zalopay quét mã QR trên website của Merchant, sau đó bấm xác nhận để thực hiện thanh toán.' },
  { title: 'App to App', icon: '🔗', color: 'text-emerald-500', desc: 'Trên App của Merchant, chọn thanh toán bằng Zalopay, app Zalopay được gọi để thanh toán.' },
  { title: 'Mobile Web to App', icon: '</>', color: 'text-purple-500', desc: 'Chọn thanh toán bằng Zalopay trên Mobile Web của Merchant, app Zalopay được gọi để thanh toán.' },
  { title: 'Cổng Zalopay', icon: '🗂️', color: 'text-orange-500', desc: 'Chọn hình thức thanh toán bằng thẻ ATM, Internet Banking, thẻ Quốc tế, Apple Pay, Zalopay QR đa năng trên web của Merchant, Zalopay GateWay được gọi để thanh toán.' },
  { title: 'QuickPay', icon: '▮▮▮', color: 'text-blue-1000', desc: 'Thu ngân của Merchant quét mã QR cá nhân của khách hàng trong app Zalopay và thực hiện thanh toán.' },
  { title: 'Web in app', icon: '🟩', color: 'text-emerald-500', desc: 'Trong app Zalopay, chọn ứng dụng web của Merchant và mua hàng. Số tiền thanh toán sẽ được trừ vào ví Zalopay.' },
  { title: 'QR tĩnh tại quầy', icon: '🧾', color: 'text-rose-500', desc: 'Khách hàng dùng app Zalopay quét mã QR của Merchant tại quầy, sau đó nhập số tiền và thực hiện thanh toán.' },
]

export function MerchantDev() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat('developer')
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1280px] px-6 h-16 flex items-center gap-5">
          <ZaloPayLogo className="h-7 shrink-0" />

          <div className="relative w-64 shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input placeholder="Tìm kiếm dịch vụ ..." className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-blue-1000" />
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-1000 hover:text-blue-1000 transition-colors"
          >
            <svg className="w-4 h-4 text-blue-1000" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.8 5.7L19.5 9.5l-5.7 1.8L12 17l-1.8-5.7L4.5 9.5l5.7-1.8L12 2z" />
            </svg>
            <span className="hidden sm:inline">Zalopay AI</span>
          </button>

          <nav className="ml-auto hidden lg:flex items-center gap-5 text-xs font-semibold text-gray-600">
            {NAV.map(n => (
              <a key={n.label} href="#" className="hover:text-blue-1000 flex items-center gap-1 whitespace-nowrap">
                {n.label}
                {n.dropdown && <span className="text-[8px] text-gray-400">▾</span>}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-1000 text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              Đa dạng về giải pháp tích hợp,<br />phù hợp với nhiều loại hình doanh nghiệp.
            </h1>
            <div className="mt-8 grid grid-cols-4 gap-3 max-w-xl">
              {HERO_TILES.map(t => (
                <button
                  key={t}
                  className="aspect-square rounded-xl border border-white/25 bg-white/5 hover:bg-white/15 transition-colors flex flex-col items-center justify-center gap-2 p-2 text-center"
                >
                  <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="text-[10px] leading-tight">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-3xl bg-white/10 flex items-center justify-center text-7xl">💳</div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="bg-app py-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Trải nghiệm giải pháp</h2>
        <p className="mt-2 text-sm text-gray-500">Trải nghiệm ngay hôm nay để hiểu thêm các giải pháp tích hợp</p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="rounded-md bg-blue-1000 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">TRẢI NGHIỆM NGAY</button>
          <button className="rounded-md border border-blue-1000 px-6 py-2.5 text-sm font-semibold text-blue-1000 hover:bg-blue-50 transition-colors">XEM TÀI LIỆU API</button>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="bg-app pb-16">
        <div className="mx-auto max-w-[1100px] px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Các giải pháp tích hợp Zalopay</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Phù hợp với nhiều loại hình doanh nghiệp</p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map(s => (
              <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className={`text-2xl ${s.color}`}>{s.icon}</div>
                <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">{s.desc}</p>
                <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-1000">→ Xem thêm</a>
              </div>
            ))}
            <div className="rounded-xl bg-transparent flex items-center justify-center text-7xl">📲</div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Liên hệ</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Liên hệ với chúng tôi để biết thêm thông tin hoặc cần hỗ trợ</p>

          <form className="mt-10 space-y-5" onSubmit={e => e.preventDefault()}>
            <Field label="ĐỊA CHỈ EMAIL" placeholder="Nhập địa chỉ email..." />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="SỐ ĐIỆN THOẠI" placeholder="Nhập số điện thoại..." />
              <Field label="MẠNG XÃ HỘI (ZALO / SKYPE)" placeholder="Nhập địa chỉ ..." required={false} />
            </div>
            <Field label="TIÊU ĐỀ" placeholder="Nhập tiêu đề..." />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">NỘI DUNG <span className="text-rose-500">*</span></label>
              <textarea rows={5} placeholder="Nhập nội dung liên hệ..." className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-1000" />
            </div>
            <div className="flex justify-center">
              <button className="rounded-md bg-blue-1000 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">Gửi liên hệ</button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-[1280px] px-6 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-8">
            <span>📞 Hotline: <a className="text-blue-1000">1900 54 54 36</a></span>
            <span>✉️ Email: <a className="text-blue-1000">hotro@zalopay.vn</a></span>
          </div>
          <p className="mt-6 text-xs text-gray-400">© 2026, bản quyền của <span className="text-blue-1000">Zalopay</span></p>
        </div>
      </footer>

      {/* Floating AI button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border-2 border-white bg-blue-1000 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.8 5.7L19.5 9.5l-5.7 1.8L12 17l-1.8-5.7L4.5 9.5l5.7-1.8L12 2z" />
          </svg>
          Zalopay AI
        </button>
      )}

      {/* Chat drawer */}
      {chatOpen && (
        <div className="fixed top-0 right-0 z-50 h-screen shadow-2xl">
          <ChatOverlay
            open={chatOpen}
            persona="developer"
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
            onNewChat={clearHistory}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

function Field({ label, placeholder, required = true }: { label: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input placeholder={placeholder} className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-1000" />
    </div>
  )
}

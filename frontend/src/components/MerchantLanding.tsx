import { useState } from 'react'
import { ChatOverlay } from './ChatOverlay'
import { ZaloPayLogo } from './ZaloPayLogo'
import { useChat } from '../hooks/useChat'

const BENEFITS = [
  {
    title: 'Tiếp cận với hơn 10 triệu người dùng của Zalopay',
    desc: 'Không tốn chi phí, sở hữu cơ hội bán hàng và phát triển tương tác với khách hàng thông qua Zalopay.',
  },
  {
    title: 'Cung cấp phần mềm quản lý giao dịch',
    desc: 'Giúp đối tác quản lý dòng tiền giao dịch qua Zalopay, không tốn phí vận hành, miễn phí dịch vụ 1 năm.',
  },
  {
    title: 'Chương trình khuyến mãi thường xuyên',
    desc: 'Đa dạng chương trình khuyến mãi với mọi người dùng và doanh nghiệp đối tác.',
  },
  {
    title: 'Đội ngũ hỗ trợ chuyên nghiệp',
    desc: 'Hỗ trợ giải quyết thắc mắc, các vấn đề kỹ thuật về tích hợp cho đối tác mọi lúc mọi nơi.',
  },
]

const SOLUTION_TABS = ['Thanh toán', 'Dịch vụ chi hộ', 'Bán hàng', 'Truyền thông', 'Cần tin & Bãi đỗ xe']

const SOLUTION_GROUPS = [
  {
    heading: 'Chấp nhận thanh toán tại cửa hàng',
    items: [
      { title: 'Mã QR tĩnh tại quầy', desc: 'Chấp nhận thanh toán tại cửa hàng bằng mã POS/Vốn quét mã.' },
      { title: 'Mã QR động trên POS', desc: 'Chấp nhận thanh toán tại cửa hàng bằng máy POS.' },
      { title: 'Thanh toán bằng máy quẹt mã', desc: 'Chấp nhận thanh toán tại cửa hàng bằng máy quẹt mã QR.' },
    ],
  },
  {
    heading: 'Chấp nhận thanh toán trực tuyến',
    items: [
      { title: 'Zalopay Gateway', desc: 'Chấp nhận thanh toán trực tuyến cho hàng web và app trên hàng của bạn.' },
      { title: 'Zalopay QR đa năng', desc: 'Một mã đa năng, thanh toán đa kênh cho cửa hàng kinh doanh hiện đại Zalopay.' },
      { title: 'Apple Pay', desc: 'Thanh toán nhanh chóng, đơn giản và an toàn với Apple Pay.' },
    ],
  },
  {
    heading: 'Thanh toán khi nhận hàng',
    items: [
      { title: 'Thanh toán khi nhận hàng — ZOD', desc: 'Chấp nhận thanh toán khi nhận hàng với Zalopay giúp gắn kết với người ở khắp nơi.' },
    ],
  },
]

const BUSINESS_TYPES = [
  { title: 'Nhà hàng & ẩm thực', desc: 'Phù hợp với nhà hàng, quán ăn, cửa hàng cafe, trà sữa và các mô hình tương tự.' },
  { title: 'Bán lẻ', desc: 'Phù hợp với siêu thị, tạp hóa, cửa hàng tiện lợi, các cửa hàng thời trang, đồ thể thao.' },
  { title: 'Dịch vụ giải trí & chăm sóc cá nhân', desc: 'Phù hợp với dịch vụ chăm sóc cá nhân (Spa, salon, gym...), giải trí (Karaoke, Bi-a...).' },
  { title: 'Truyền thông', desc: 'Tiếp cận hàng triệu khách hàng với gói giải pháp truyền thông đa dạng.' },
  { title: 'Căn tin', desc: 'Tối ưu quá trình đặt món với giải pháp thanh toán không dùng tiền mặt.' },
  { title: 'Bãi đỗ xe', desc: 'Thanh toán nhanh, áp dụng cho bãi đỗ xe và sử dụng tiện lợi, trong tầm thường mọi doanh nghiệp.' },
]

const PARTNERS = ['VISA', 'Viettel', 'napas', 'Apple Pay', 'Google', 'Grab', 'Lazada', 'TikTok', 'BAEMIN', 'CGV']

const STEPS = [
  { title: 'Bước 1', desc: 'Tạo tài khoản Zalopay Merchant sử dụng số điện thoại.' },
  { title: 'Bước 2', desc: 'Điền các thông tin doanh nghiệp bao gồm tài khoản ngân hàng nhận tiền.' },
  { title: 'Bước 3', desc: 'Xác nhận hợp đồng & điều khoản điều kiện bằng cách nhập mã OTP gửi qua tin nhắn để hoàn tất bước 2.' },
  { title: 'Hoàn thành', desc: 'Đối tác có thể sử dụng ngay giải pháp Mã QR tại quầy.' },
]

const FAQS = [
  'Chi phí đăng ký',
  'Các giải pháp thanh toán cho kinh doanh Offline',
  'Tài liệu cần thiết khi đăng ký',
  'Quy trình đăng ký',
  'Thời gian phản hồi tình trạng hồ sơ và kết quả đăng ký?',
]

export function MerchantLanding() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat('merchant')
  const [chatOpen, setChatOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZaloPayLogo className="h-7" />
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-blue-1000">Trang chủ</a>
            <a href="#solutions" className="hover:text-blue-1000">Giải pháp</a>
            <a href="#steps" className="hover:text-blue-1000">Hướng dẫn tích hợp</a>
            <a href="#faq" className="hover:text-blue-1000">Hỗ trợ</a>
          </nav>
          <button className="rounded-lg bg-blue-1000 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">
            Đăng ký thành Đối tác
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
            Nền tảng <span className="text-blue-1000">giải pháp toàn diện</span> cho mọi nhu cầu kinh doanh
          </h1>
          <p className="mt-5 text-gray-600 text-lg">
            Zalopay cung cấp hơn 50+ giải pháp để phát triển kinh doanh của cửa hàng online và offline.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button className="rounded-lg bg-blue-1000 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">
              Trở thành đối tác
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-1000 px-6 py-3 text-sm font-semibold text-blue-1000 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l1.8 5.7L19.5 9.5l-5.7 1.8L12 17l-1.8-5.7L4.5 9.5l5.7-1.8L12 2z" />
              </svg>
              Tư vấn giải pháp với Zalopay AI
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md aspect-[4/3] rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
            <span className="text-7xl">🛍️</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-blue-50/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-blue-1000">Lợi ích khi trở thành Đối tác</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">Tăng trưởng doanh thu cùng Zalopay</h2>
          <p className="mt-3 text-center text-gray-600">Những lợi ích bạn và doanh nghiệp của mình nhận được khi trở thành đối tác của Zalopay</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">✅</div>
                <h3 className="mt-4 font-semibold text-gray-900">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-blue-1000">Nền tảng toàn diện và thống nhất</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">Giải pháp tích hợp toàn diện kết nối mọi hoạt động trong doanh nghiệp của bạn.</h2>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {SOLUTION_TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  tab === i ? 'bg-blue-1000 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {SOLUTION_GROUPS.map(group => (
              <div key={group.heading}>
                <h3 className="font-semibold text-gray-900 mb-4">{group.heading}</h3>
                <div className="flex flex-col gap-3">
                  {group.items.map(item => (
                    <div key={item.title} className="rounded-xl border border-gray-100 p-4 hover:border-blue-1000/40 hover:shadow-sm transition-all">
                      <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      <span className="mt-2 inline-block text-xs font-medium text-blue-1000">Khám phá ngay →</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="bg-blue-50/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-blue-1000">Phù hợp với mọi loại hình doanh nghiệp</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">Cung cấp những giải pháp phù hợp với nhiều doanh nghiệp có quy mô và loại hình khác nhau</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_TYPES.map(b => (
              <div key={b.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🏬</div>
                <h3 className="mt-4 font-semibold text-gray-900">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-1000">Nền tảng toàn diện và thống nhất</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Đối tác chiến lược của Zalopay</h2>
          <p className="mt-3 text-gray-600">Được tin tưởng bởi 15,000+ doanh nghiệp có quy mô và lĩnh vực khác nhau.</p>
          <div className="mt-10 grid grid-cols-3 sm:grid-cols-5 gap-4">
            {PARTNERS.map(p => (
              <div key={p} className="rounded-xl bg-gray-50 h-20 flex items-center justify-center font-semibold text-gray-500">
                {p}
              </div>
            ))}
            <div className="rounded-xl bg-blue-50 h-20 flex flex-col items-center justify-center text-blue-1000">
              <span className="font-bold text-lg">15,000+</span>
              <span className="text-xs">Đối tác</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="bg-blue-50/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Chỉ với <span className="text-blue-1000">5 phút</span> duyệt hồ sơ. Trở thành Đối tác của chúng tôi ngay hôm nay!
          </h2>
          <div className="mt-12 grid md:grid-cols-2 gap-10 items-start">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Bước 1</p>
              <p className="text-sm text-gray-500 mb-4">Tạo tài khoản</p>
              <div className="space-y-3">
                <div className="h-10 rounded-lg border border-gray-200 px-3 flex items-center text-sm text-gray-400">Số điện thoại</div>
                <div className="h-10 rounded-lg border border-gray-200 px-3 flex items-center text-sm text-gray-400">Nhập mã OTP</div>
                <button className="w-full rounded-lg bg-blue-1000 py-2.5 text-sm font-semibold text-white">Tiếp tục</button>
              </div>
            </div>
            <ol className="space-y-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-blue-1000 text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-600">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-10 flex justify-center">
            <button className="rounded-lg bg-blue-1000 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">
              Trở thành đối tác của chúng tôi 🚀
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((q, i) => (
              <div key={q} className="rounded-xl border border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800"
                >
                  {q}
                  <span className="text-gray-400">{openFaq === i ? '−' : '⌄'}</span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-gray-600">
                    Vui lòng liên hệ đội ngũ Zalopay hoặc dùng trợ lý AI để được tư vấn chi tiết về "{q.toLowerCase()}".
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-500 text-white py-12">
        <div className="mx-auto max-w-6xl px-4 grid sm:grid-cols-3 gap-8">
          <div>
            <ZaloPayLogo className="h-6" onDark />
            <p className="mt-3 text-sm text-blue-100/70">Tài chính tích hợp</p>
          </div>
          <div>
            <p className="font-semibold">Liên hệ</p>
            <p className="mt-3 text-sm text-blue-100/70">Số điện thoại: 1900-545-436</p>
            <p className="text-sm text-blue-100/70">Email: cp@zalopay.vn</p>
          </div>
          <div>
            <p className="font-semibold">Công ty Cổ phần ZION</p>
            <p className="mt-3 text-sm text-blue-100/70">© 2025 - Copyright of Zalopay.</p>
          </div>
        </div>
      </footer>

      {/* Floating AI button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-1000 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-900 transition-colors"
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
            persona="merchant"
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

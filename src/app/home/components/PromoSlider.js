// app/home/components/PromoSlider.js
'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const slides = [
  {
    title: 'SHARE A $150,000 PRIZE POOL',
    subtitle: 'BNB CRYPTOBACK',
    icon: '/crypto/bnb.svg',
    bg: 'bg-[#232736]'
  },
  {
    title: 'REFER FRIENDS TO WIN',
    subtitle: 'Earn $10 for each signup',
    icon: '/crypto/eth.svg',
    bg: 'bg-[#22333d]'
  },
  {
    title: 'UPGRADE ACCOUNT',
    subtitle: 'Get Premium Features',
    icon: '/crypto/btc.svg',
    bg: 'bg-[#232730]'
  }
]

export default function PromoSlider() {
  return (
    <section className="w-full px-0 pt-4 pb-4">
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2000, // 2 seconds
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        loop
        className="w-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className={`w-full flex items-center justify-between rounded-2xl shadow p-6 min-h-[100px] ${slide.bg}`}>
              <div>
                <div className="text-gray-300 text-md mb-1 tracking-widest">{slide.title}</div>
                <div className="text-white font-bold text-2xl">{slide.subtitle}</div>
              </div>
              <img
                src={slide.icon}
                alt=""
                className="w-14 h-14 object-contain"
                style={{ opacity: 0.9 }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

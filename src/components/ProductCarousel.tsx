'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import { Product } from '@/types/products';
import EInkProductCard from './EInkProductCard';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product, sourceElement?: HTMLElement | null) => void;
}

/**
 * 3D Carousel with page-flipping effect for products
 */
export default function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  return (
    <div className="product-carousel-container">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        initialSlide={1}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false,
        }}
        speed={500}
        watchOverflow={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[EffectCoverflow, Navigation, Pagination]}
        className="product-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <EInkProductCard
              product={product}
              onAddToCart={onAddToCart}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


"use client";
// 傳入的<Image />需要在client component中使用

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import styles from "./AutoPlaySwiper.module.css";

type AutoPlaySwiperPropsType = {
  swiperSlideArr: React.ReactNode[];
};

export default function AutoPlaySwiper({
  swiperSlideArr,
}: AutoPlaySwiperPropsType) {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2800,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination, Navigation]}
      className={`mySwiper ${styles.autoPlaySwiper}`}
    >
      {swiperSlideArr.map((slide, index) => {
        return <SwiperSlide key={`slide${index}`}>{slide}</SwiperSlide>;
      })}
    </Swiper>
  );
}

"use client";

// import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

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
      className="mySwiper"
    >
      {swiperSlideArr.map((slide, index) => {
        return <SwiperSlide key={`slide${index}`}>{slide}</SwiperSlide>;
      })}
    </Swiper>
  );
}

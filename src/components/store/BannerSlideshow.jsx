import React, { useState, useEffect } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";
import apiClient from "../../utils/apiClient";

function BannerSlideshow() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (path) => {
    const API_URL = "http://localhost:5000";
    return `${API_URL}${path}`;
  };

  const fetchBanners = async () => {
    try {
      const { data } = await apiClient.get("/banners/getbanner");
      setSlides(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  // 1. Updated Loading State to match new padding layout
  if (slides.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-4">
        <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[400px] bg-gray-300 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  return (
    // 2. Main Container: Added px-4 for side padding and py-4 for vertical spacing
    <div className="w-full max-w-[1400px] mx-auto px-4 py-4 relative group">
      
      {/* 3. The Frame: Added rounded-2xl and overflow-hidden to create the frame effect */}
      <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[400px]  overflow-hidden relative shadow-lg">
        
        {/* 4. The Image: Switched to <img> tag with object-cover */}
        <img
          src={getImageUrl(slides[currentIndex].imageUrl)}
          alt={`Slide ${currentIndex}`}
          className="w-full h-full object-cover duration-500 block"
        />

        {/* Left Arrow */}
        <div className="hidden group-hover:block absolute top-[50%] -translate-y-[50%] left-4 text-xl sm:text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-all">
          <BsChevronCompactLeft onClick={prevSlide} size={30} />
        </div>

        {/* Right Arrow */}
        <div className="hidden group-hover:block absolute top-[50%] -translate-y-[50%] right-4 text-xl sm:text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-all">
          <BsChevronCompactRight onClick={nextSlide} size={30} />
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center py-2">
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`text-lg sm:text-xl cursor-pointer mx-1 ${
                currentIndex === slideIndex ? "text-white scale-125" : "text-white/50"
              } transition-all duration-300`}
            >
              <RxDotFilled />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BannerSlideshow;
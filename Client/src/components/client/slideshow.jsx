import React, { useState, useEffect, useRef } from "react";
import { UseGetData } from "../../services/service_api";
import { Link } from "react-router-dom";

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const slideRef = useRef(null);
  const intervalRef = useRef(null);

  const [slides, setSlides] = useState([]);

  const FetchData = async () => {
    const { data } = await UseGetData("api/slideshows?populate=*");
    let itemSlides = [];

    data?.data?.map((item) => {
      const newItemSlides = {
        title: item.shorturl,
        image: `${import.meta.env.VITE_BASE_URL}${item?.thumbnail?.url}`,
      };

      if (item?.thumbnail?.url && item?.status_show == "active") {
        itemSlides.push(newItemSlides);
      }
    });

    setSlides(itemSlides);
  };

  const startTimer = () => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 2000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    FetchData();
    startTimer();
    return () => stopTimer();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    startTimer();
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
    startTimer();
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    startTimer();
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.type.includes("mouse") ? e.pageX : e.touches[0].pageX);
    stopTimer();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startTimer();
  };

  const getTranslateX = () => {
    const totalSlides = slides.length;
    const baseTranslate = -currentIndex * 100;
    return `${baseTranslate}%`;
  };

  return (
    <div className="relative w-full overflow-hidden cursor-grab">
      <div
        ref={slideRef}
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(${getTranslateX()})` }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {slides.map((slide, index) => (
          <Link
            to={slide.title}
            className="min-w-full h-64 relative  overflow-hidden"
            key={index}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="object-cover w-full h-full"
              draggable="false"
            />
          </Link>
        ))}
      </div>

      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-base/70 hover:bg-secondary text-secondary hover:text-white font-extrabold pr-3 transition-all duration-200"
        onClick={prevSlide}
        style={{
          clipPath: "polygon(0 0, 0 100%, 99% 50%)",
          width: "25px",
          height: "40px",
        }}
      >
        <span className="transform -translate-y-1/4">❮</span>
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-base/70 hover:bg-secondary text-secondary hover:text-white font-extrabold pl-3"
        onClick={nextSlide}
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
          width: "25px",
          height: "40px",
        }}
      >
        ❯
      </button>
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`block h-3 w-3 rounded-full cursor-pointer transition duration-200 ${
              currentIndex % slides.length === index
                ? "bg-secondary"
                : "bg-base/50 hover:bg-secondary"
            }`}
            onClick={() => handleDotClick(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;

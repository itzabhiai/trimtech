import React, { useState,useEffect } from 'react';
import './CarouselComponent.css';
import { AiFillCaretRight ,AiFillCaretLeft } from "react-icons/ai";
const CarouselComponent = () => {
  const images = [
    'img/trimtech.jpg',
    'img/shop.jpg',
    
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 10000); 
    return () => clearInterval(interval); 
  }, [currentIndex]); 
  return (
    <div className="carousel-container">
      <div className="carousel-slide" style={{ backgroundImage: `url(${images[currentIndex]})` }}>
        <button className="carousel-button prev-button" onClick={goToPrevious}>
          <i className="fas fa-chevron-left"><AiFillCaretLeft /> </i>
        </button>
        <button className="carousel-button next-button" onClick={goToNext}>
          <i className="fas fa-chevron-right"><AiFillCaretRight /></i>
        </button>
      </div>
    </div>
  );
};


export default CarouselComponent;

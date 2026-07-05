// components/home/HeroSection.jsx
import { Link } from 'react-router-dom';
import './hero.css';

const HeroSection = () => {
  return (
    <section className="hefno-hero">
      {/* الخلفية النباتية */}
      <div className="hero-botanical-background">
      </div>

      {/* المحتوى الرئيسي */}
      <div className="hero-container" style={{ direction: 'ltr' }}>
        <div className="hero-content">
          {/* Hefno plant كبيرة جداً وبتدرج أخضر */}
          <h1 className="hero-title-large">
            <span className="gradient-green">Hefno plant</span>
          </h1>
          
          {/* النص الفرعي صغير بلون أسمر */}
          <p className="hero-subtitle">
            AI powered Smart Agriculture Decision Support <br />
            & Crop Health Platform
          </p>
          
          {/* الزرار زي ما هو */}
          <div className="hero-buttons">
            <Link to="/knowledge-base" className="emerald-btn">
              Start Learning Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
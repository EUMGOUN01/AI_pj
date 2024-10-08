import React from 'react';
import '../../CSS/Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <h2 className="footer-title">TREND FLOW</h2>
        <p className="footer-description">AI 학습모델 웹서비스 개발 프로젝트</p>
        
        <div className="footer-team">
          <h3 className="footer-section-title">팀원</h3>
          <ul className="footer-team-list">
            <li>한창록 (팀장, 백엔드), 김선신 (데이터 분석), 박영빈 (데이터 분석), 엄고운 (프론트)</li>
          </ul>
        </div>
        
        <div className="footer-address">
          <h3 className="footer-section-title">주소</h3>
          <p>부산 금정구 AI 혁신센터 123호</p>
        </div>
      
        <div className="footer-copyright">
          <p>© 2024 TREND FLOW. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
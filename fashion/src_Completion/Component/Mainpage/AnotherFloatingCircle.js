// AnotherFloatingCircle.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset } from '@fortawesome/free-solid-svg-icons'; // 아이콘 임포트
import '../../CSS/AnotherFloatingCircle.css';
import Chatbot from '../Mainpage/Chatbot'; // Chatbot 컴포넌트 임포트

const AnotherFloatingCircle = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // 챗봇 열기/닫기 토글 함수
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      <div className="another-floating-circle" onClick={toggleChatbot}>
        <FontAwesomeIcon icon={faHeadset} className="another-icon" /> {/* 아이콘 추가 */}
      </div>
      {isChatbotOpen && <Chatbot onClose={toggleChatbot} />}
    </>
  );
};

export default AnotherFloatingCircle;
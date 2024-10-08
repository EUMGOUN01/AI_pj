// Chatbot.js
import React, { useState } from 'react';
import '../../CSS/Chatbot.css';

const Chatbot = ({ onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);

  // 질문 선택 시 새로운 질문과 답변을 추가하는 함수
  const handleQuestionClick = (question) => {
    let answer = '';
    if (question === '사이트가 불안정하게 작동하는것 같습니다.') {
      answer = 'Q&A 게시판에 문의 해주세요.';
    } else if (question === '결제에 계속 실패합니다.') {
      answer = 'Q&A 게시판에 문의 해주세요.';
    } else if (question === '상품을 환불하고 싶습니다.') {
      answer = 'Q&A 게시판에 문의 해주세요.';
    }

    // 기존 채팅 기록에 새로운 질문과 답변을 추가
    setChatHistory([...chatHistory, { type: 'user', text: question }, { type: 'bot', text: answer }]);
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <span>TF 챗봇</span>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
      <div className="chatbot-content">
        <div className="greeting-message">
          TREND FLOW의 챗봇, TF 입니다. <br />
          원하시는 메뉴를 선택해주세요.
        </div>
        
        <div className="faq-section">
          <div className="faq-title">자주하는 질문</div>
          <div className="faq-item" onClick={() => handleQuestionClick('사이트가 불안정하게 작동하는것 같습니다.')}>
            사이트가 불안정하게 작동하는것 같습니다.
          </div>
          <div className="faq-item" onClick={() => handleQuestionClick('결제에 계속 실패합니다.')}>
            결제에 계속 실패합니다.
          </div>
          <div className="faq-item" onClick={() => handleQuestionClick('상품을 환불하고 싶습니다.')}>
            상품을 환불하고 싶습니다.
          </div>
        </div>

        {/* 채팅 기록을 화면에 표시 */}
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-entry ${chat.type}`}>
            <div className={chat.type === 'user' ? 'user-question' : 'chatbot-answer'}>
              {chat.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;
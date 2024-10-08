import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../CSS/UserFind.css'; 

const UserFind = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 전달받은 username을 location.state에서 가져옴
  const username = location.state?.username || '';

  // 아이디가 두 글자 이하일 경우 마스킹 처리 예외 처리
  const maskedUsername = username.length > 2 
    ? username.slice(0, 2) + '***' + username.slice(-1) 
    : username.slice(0, 1) + '*';

  const handleConfirmClick = () => {
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <div className="user-find-complete-container">
      <div className="user-find-complete-box">
        {username ? (
          <>
            <h2>아이디 찾기 완료</h2>
            <p>사용자님의 아이디는 <span className="user-find-id-highlight">{maskedUsername}</span> 입니다.</p>
            <div className="user-find-info-box">
              <p>정보 보호를 위해 아이디의 일부만 공개합니다.</p>
            </div>
            <button className="user-find-confirm-btn" onClick={handleConfirmClick}>확인</button>
          </>
        ) : (
          <p>잘못된 접근입니다. 다시 시도해주세요.</p>
        )}
      </div>
    </div>
  );
}

export default UserFind;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import '../../CSS/RePass.css'; 

const RePass = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 오류 메시지 상태 추가
  const [successMessage, setSuccessMessage] = useState(''); // 성공 메시지 상태 추가
  const navigate = useNavigate(); // navigate 변수 선언
  const location = useLocation(); // URL에 포함된 토큰 가져오기
  
  // URL에서 토큰 추출 
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // 비밀번호 재설정 토큰

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 유효성 검사 (길이)
    if (newPassword.length < 8 || newPassword.length > 15) {
      setErrorMessage('비밀번호는 8자에서 15자 사이여야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('http://10.125.121.188:8080/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token, // 백엔드에 비밀번호 재설정 토큰도 함께 전송
          newPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
        setErrorMessage('');
        // 성공 메시지를 잠시 보여준 후 로그인 페이지로 이동
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || '비밀번호 재설정에 실패했습니다.');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
      setSuccessMessage('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value === '') {
      setErrorMessage(''); // 입력값이 지워졌을 때 오류 메시지 제거
    } else if (newPassword !== value) {
      setErrorMessage('비밀번호가 일치하지 않습니다.'); // 불일치 시 오류 메시지
    } else {
      setErrorMessage(''); // 일치 시 오류 메시지 제거
    }
  };

  return (
    <div className="repass-container">
      <div className="repass-box">
        <h2 className="repass-title">비밀번호 재설정</h2>
        <p className="repass-subtitle">8자 - 15자 이하로 입력해주세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="repass-form-group">
            <label htmlFor="new-password" className="repass-label">새 비밀번호</label>
            <input
              type="password"
              id="new-password"
              className="repass-input"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="repass-form-group">
            <label htmlFor="confirm-password" className="repass-label">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirm-password"
              className="repass-input"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            {/* 비밀번호가 일치하지 않으면 오류 메시지 표시 */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
          </div>
          <button 
            type="submit" 
            className="repass-submit-button" 
            disabled={newPassword === '' || confirmPassword === '' || newPassword !== confirmPassword}
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default RePass;
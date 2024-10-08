import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Pass.css'; 

const Pass = () => {
    const [username, setUsername] = useState(''); // 아이디 상태 관리
    const [email, setEmail] = useState(''); // 이메일 상태 관리
    const [error, setError] = useState(''); // 에러 메시지 상태
    const [message, setMessage] = useState(''); // 성공 메시지 상태
    const navigate = useNavigate(); 

    const handleSubmit = async () => {
        // 아이디나 이메일이 비어있을 경우 처리
        if (!username || !email) {
            setError('아이디와 이메일을 모두 입력해주세요.');
            setMessage('');
            return;
        }

        try {
            const response = await fetch('http://10.125.121.188:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email }) // 사용자 입력값 전송
            });

            if (response.ok) {
                setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.'); // 성공 메시지 설정
                setError(''); // 에러 메시지 초기화
                // 비밀번호 재설정 확인 페이지로 이동할 수 있음
                navigate('/passcheck'); 
            } else {
                const errorData = await response.json();
                setError(errorData.message || '비밀번호 재설정 요청에 실패했습니다.');
                setMessage(''); // 성공 메시지 초기화
            }
        } catch (error) {
            setError('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
            setMessage(''); // 성공 메시지 초기화
        }
    };

    return (
      <div className="pass-container">
        <div className="pass-box">
          <h2 className="pass-title">비밀번호 찾기</h2>
          <p className="pass-subtitle">
            가입 당시 아이디와 이메일을 입력해주세요.
          </p>
          <div className="pass-form-group">
            <label htmlFor="pass-id" className="pass-label">아이디</label>
            <input 
                type="text" 
                id="pass-id" 
                className="pass-input" 
                placeholder="아이디 입력" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} // 아이디 입력값 상태 관리
            />
          </div>
          <div className="pass-form-group">
            <label htmlFor="pass-email" className="pass-label">이메일</label>
            <input 
                type="email" 
                id="pass-email" 
                className="pass-input" 
                placeholder="이메일 입력" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} // 이메일 입력값 상태 관리
            />
          </div>
          {error && <div className="pass-error-message">{error}</div>} {/* 에러 메시지 표시 */}
          {message && <div className="pass-success-message">{message}</div>} {/* 성공 메시지 표시 */}
          <button className="pass-submit-button" onClick={handleSubmit}>확인</button>
        </div>
      </div>
    );
}

export default Pass;
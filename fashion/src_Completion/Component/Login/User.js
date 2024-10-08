import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/User.css'; 

const User = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async () => {
        // 유효성 검사: 이름과 이메일이 입력되었는지 확인
        if (!name || !email) {
            setError('이름과 이메일을 모두 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://10.125.121.188:8080/api/auth/find-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }) // 이름과 이메일을 백엔드로 전송
            });

            if (response.ok) {
                const data = await response.json();
                // 아이디 찾기 성공 후 아이디 찾기 완료 페이지로 이동하면서 username 데이터 전달
                navigate('/userfind', { state: { username: data.username } });
            } else {
                const errorData = await response.json();
                setError(errorData.message || '아이디를 찾을 수 없습니다.');
            }
        } catch (error) {
            setError('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
        }
    };

    return (
      <div className="user-container">
        <div className="user-box">
          <h2 className="user-title">아이디 찾기</h2>
          <p className="user-subtitle">
            가입 당시의 이름과 이메일을 입력해주세요.
          </p>
          <div className="user-form-group">
            <label htmlFor="user-id" className="user-label">이름</label>
            <input 
                type="text" 
                id="user-id" 
                className="user-input" 
                placeholder="이름을 입력해주세요." 
                value={name}
                onChange={(e) => setName(e.target.value)} // 입력 값 상태 관리
            />
          </div>
          <div className="user-form-group">
            <label htmlFor="user-email" className="user-label">이메일</label>
            <input 
                type="email" 
                id="user-email" 
                className="user-input" 
                placeholder="이메일을 입력해주세요." 
                value={email}
                onChange={(e) => setEmail(e.target.value)} // 입력 값 상태 관리
            />
          </div>
          {error && <div className="user-error-message">{error}</div>} {/* 에러 메시지 표시 */}
          <button className="user-submit-button" onClick={handleSubmit}>확인</button>
        </div>
      </div>
    );
};

export default User;
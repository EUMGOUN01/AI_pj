import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/PassCheck.css';  

const PassCheck = () => {
    const navigate = useNavigate();

    const goToMain = () => {
        navigate('/'); 
    };

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="passcheck-container">
            <div className="passcheck-box">
                <h2 className="passcheck-title">비밀번호 변경 안내문</h2>
                <p className="passcheck-message">가입 시 입력한 이메일을 확인해 비밀번호</p>
                <p className="passcheck-messages">재설정 인증을 완료하세요.</p>
                <div className="passcheck-buttons">
                    <button className="passcheck-button" onClick={goToMain}>메인</button>
                    <button className="passcheck-button" onClick={goToLogin}>로그인</button>
                </div>
            </div>
        </div>
    );
};

export default PassCheck;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Completion.css';

const Completion = () => {
    const navigate = useNavigate();

    const goToMain = () => {
        navigate('/'); // 메인 페이지로 이동
    };

    const goToLogin = () => {
        navigate('/login'); // 로그인 페이지로 이동
    };

    return (
        <div className="completion-container">
            <div className="completion-box">
                <h2 className="completion-title">회원가입 완료</h2>
                <p className="completion-message">TRENDFLOW에 회원으로 가입해주셔서 감사합니다.</p>
                <div className="completion-buttons">
                    <button className="completion-button" onClick={goToMain}>메인</button>
                    <button className="completion-button" onClick={goToLogin}>로그인</button>
                </div>
            </div>
        </div>
    );
}

export default Completion;
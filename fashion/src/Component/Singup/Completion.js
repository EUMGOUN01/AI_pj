import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../CSS/Completion.css';

const Completion = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // useEffect를 사용하여 컴포넌트가 로드될 때 이메일 인증을 처리
    useEffect(() => {
        const verifyEmail = async () => {
            // URL에서 토큰 가져오기
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (!token) {
                alert("인증 토큰이 없습니다. 메인 페이지로 이동합니다.");
                navigate('/'); // 토큰이 없으면 메인 페이지로 이동
                return;
            }

            try {
                const response = await fetch(`http://10.125.121.188:8080/api/auth/verify?token=${token}`, {
                    method: 'GET',
                });

                if (response.ok) {
                    alert('이메일 인증이 성공적으로 완료되었습니다.');
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || '이메일 인증에 실패했습니다.');
                }
            } catch (error) {
                alert('인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        };

        verifyEmail();
    }, [location, navigate]);

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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 회원 로그인 처리
    const handleLogin = async () => {
        if (!username || !password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://10.125.121.188:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }), // 요청 본문에 username과 password 전송
            });

            if (response.ok) {
                const data = await response.json();
                // 응답에서 accessToken, refreshToken, role, username 저장
                localStorage.setItem('accessToken', data.accessToken); // accessToken 저장
                localStorage.setItem('refreshToken', data.refreshToken); // refreshToken 저장
                localStorage.setItem('role', data.role); // role 저장
                localStorage.setItem('username', data.username); // username 저장
                sessionStorage.setItem('userLoggedIn', 'true'); // 로그인 상태 저장
                localStorage.removeItem('guestLogin'); // 비회원 상태 제거

                // /products 페이지로 이동
                navigate('/products');

                // 페이지 리로딩
                window.location.reload();

                // 권한에 따른 페이지 리다이렉션
                if (data.role === 'ADMIN') {
                    navigate('/products');
                } else {
                    navigate('/products'); // 사용자 홈으로 이동
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            setError('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
        }
    };

    // 비회원 로그인 처리
    const handleGuestLogin = () => {
        sessionStorage.setItem('guestLogin', 'true'); // 비회원 로그인 상태를 sessionStorage에 저장
        navigate('/'); // 비회원 로그인 후 홈으로 이동
        window.location.reload(); // 헤더 상태를 갱신하기 위해 페이지를 새로고침
    };

    // 엔터 키 이벤트 핸들러
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="custom-login-outer">
            <div className="custom-login-container">
                <div className="custom-login-header">
                    <h2 className="custom-login-title">로그인</h2>
                </div>
                <div className="custom-login-form-container">
                    <div className="custom-form-group">
                        <label htmlFor="username" className="custom-form-label">아이디</label>
                        <input
                            id="username"
                            className="custom-form-input"
                            type="text"
                            placeholder="아이디 입력"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress} // 엔터 키 입력 이벤트 추가
                        />
                    </div>
                    <div className="custom-form-group">
                        <label htmlFor="password" className="custom-form-label-password">비밀번호</label>
                        <input
                            id="password"
                            className="custom-form-input"
                            type="password"
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress} // 엔터 키 입력 이벤트 추가
                        />
                    </div>
                    {error && <div className="custom-error-message">{error}</div>}
                    <div className="custom-submit-button-container">
                        <button className="custom-submit-button" onClick={handleLogin}>로그인</button>
                    </div>
                    {/* 비회원 로그인 버튼 추가 */}
                    <div className="custom-guest-login-container">
                        <button className="custom-guest-login-button" onClick={handleGuestLogin}>비회원 로그인</button>
                    </div>
                </div>
                <div className="custom-signup-redirect">
                    <span>아직 계정이 없으신가요?</span>
                    <a href="/signup" className="custom-signup-link">가입하기</a>
                </div>
                <div className="custom-signup-redirects">
                    <span>계정을 잊으버리셨나요?</span>
                    <a href="/find-username" className="custom-signup-link">아이디 찾기</a>
                    <a href="/find-password" className="custom-signup-link"> / 비밀번호 찾기</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Login.css';
import { fetchAPI } from '../../hook/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 로컬 스토리지에 유저 정보 저장
    const storeUserData = (data) => {
        const expiresIn = data.accessExpiration || 3600; // 서버에서 제공하는 만료 시간 (초 단위), 기본값 1시간
        const expirationTime = new Date().getTime() + expiresIn * 1000; // 현재 시간 + 만료 시간
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('tokenExpiration', data.accessExpiration); //만료시간 저장
    };
    // 장바구니 데이터 서버 전송 및 처리
    const sendGuestCartToServer = async () => {
        const guestCartItems = sessionStorage.getItem('cartItems');

        if (guestCartItems) {
            // cartItems에서 필요한 필드만 추출 (productId, quantity, size)
            const parsedCartItems = JSON.parse(guestCartItems);
            const cartDataToSend = parsedCartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size 
            }));
            console.log(cartDataToSend)

            // 추출된 데이터 서버로 전송
            await fetchAPI('/cart/add', {
                method: 'POST',
                body: JSON.stringify(cartDataToSend),
            });
            // 전송 후 장바구니 삭제
            sessionStorage.removeItem('cartItems');
        }
    };


    // 리다이렉트 처리 및 페이지 새로고침
    const redirectUser = (role) => {
        navigate(role === 'ADMIN' ? '/admin' : '/products');
        // window.location.reload(); // 헤더 상태 갱신을 위한 새로고침
    };

    // 에러 처리 함수
    const handleError = (errorMessage) => {
        setError(errorMessage || '서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    };

    // 회원 로그인 처리
    const handleLogin = async () => {
        if (!username || !password) {
            handleError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const data = await fetchAPI('auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            console.log(data.accessExpiration)
            // 로그인 성공 시 토큰 및 사용자 정보 저장
            storeUserData(data);

            // 비회원 장바구니 데이터를 서버로 전송
            await sendGuestCartToServer();

            // 리다이렉트 처리
            redirectUser(data.role);
        } catch (error) {
            // error 객체에서 response 상태 코드 확인
            if (error.message.includes('400')) {
                handleError('아이디 또는 비밀번호가 틀렸습니다.');
            } else if (error.message.includes('500')) {
                handleError('서버에 오류가 발생했습니다. 다시 시도해주세요.');
            } else {
                // 그 외 에러 처리
                handleError('로그인에 실패했습니다. 다시 시도해주세요.');
            }
        }
    };

    // 비회원 로그인 처리
    const handleGuestLogin = () => {
        localStorage.setItem('username', 'GUEST'); // GUEST 유저 설정
        redirectUser('GUEST'); // 비회원은 홈으로 리다이렉트
    };

    // 엔터 키 입력 시 로그인 처리
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
                            onKeyPress={handleKeyPress} // 엔터 키 입력 처리
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
                            onKeyPress={handleKeyPress} // 엔터 키 입력 처리
                        />
                    </div>
                    {error && <div className="custom-error-message">{error}</div>}
                    <div className="custom-submit-button-container">
                        <button className="custom-submit-button" onClick={handleLogin}>로그인</button>
                    </div>
                    {/* 비회원 로그인 버튼 */}
                    <div className="custom-guest-login-container">
                        <button className="custom-guest-login-button" onClick={handleGuestLogin}>비회원 로그인</button>
                    </div>
                </div>
                <div className="custom-signup-redirect">
                    <span>아직 계정이 없으신가요?</span>
                    <a href="/signup" className="custom-signup-link">가입하기</a>
                </div>
                <div className="custom-signup-redirects">
                    <span>계정을 잊으셨나요?</span>
                    <a href="/find-username" className="custom-signup-link">아이디 찾기</a>
                    <a href="/find-password" className="custom-signup-link"> / 비밀번호 찾기</a>
                </div>
            </div>
        </div>
    );
};

export default Login;

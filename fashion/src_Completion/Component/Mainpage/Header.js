import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Header.css';

const Header = () => {
  const [isGuest, setIsGuest] = useState(false); // 비회원 상태 관리
  const [username, setUsername] = useState(''); // 로그인한 유저의 이름
  const navigate = useNavigate();

  // 로그인 상태 확인 및 상태 업데이트
  const checkLoginStatus = () => {
    const loggedUsername = localStorage.getItem('username'); // localStorage에서 username 가져오기

    if (loggedUsername === 'GUEST') {
      setIsGuest(true);        // 비회원 상태로 설정
      setUsername('GUEST');    // 유저 이름을 GUEST로 설정
    } else if (loggedUsername) {
      setIsGuest(false);       // 비회원이 아니므로 false로 설정
      setUsername(loggedUsername); // 유저 이름 설정
    } else {
      setIsGuest(false);       // 비회원이 아니며 로그인하지 않은 상태
      setUsername('');         // 유저 이름 초기화
    }
  };

  useEffect(() => {
    // 초기 로드 시 로그인 상태 확인
    checkLoginStatus();

    // 다른 탭에서 localStorage가 변경된 경우 동기화
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로그아웃 처리 및 상태 업데이트
  const handleLogout = () => {
    setIsGuest(false);
    setUsername(''); // 유저 이름 초기화
    sessionStorage.removeItem('cartItems'); // 로그아웃 시 상품제거
    localStorage.clear() 
    sessionStorage.clear()
    checkLoginStatus(); // 상태 갱신 (즉시 반영)
    navigate('/'); // 로그아웃 후 홈으로 이동
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="logo">
          <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            TREND FLOW
          </Link>
        </h1>
        <nav className="sub-menu">
          <ul>
            <li><Link to="/products">전체상품</Link></li>
            <li><Link to="/analysis">패션 분석</Link></li>
          </ul>
        </nav>
      </div>
      <nav className="header-right">
        <ul>
          {username ? (
            <>
              <li>{`${username}님`}</li> {/* 로그인한 사용자 이름 표시 */}
              {isGuest ? (
                <>
                  <li><Link to="/login">로그인</Link></li> {/* 비회원 로그인 상태 */}
                  <li><Link to="/signup">회원가입</Link></li> {/* 회원가입 버튼 */}
                </>
              ) : (
                <>
                  <li>
                    <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>
                      로그아웃
                    </button>
                  </li>
                </>
              )}
            </>
          ) : (
            <>
              <li><Link to="/login">로그인</Link></li> {/* 로그인 버튼은 비회원 상태가 아닐 때만 표시 */}
              <li><Link to="/signup">회원가입</Link></li>
            </>
          )}

          <li><Link to="/qna">Q&A</Link></li>
          {localStorage.getItem('accessToken') && <li><Link to="/mypage">마이페이지</Link></li>}
          <li><Link to="/cart">장바구니</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;

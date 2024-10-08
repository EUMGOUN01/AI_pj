import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Header.css';

const Header = () => {
  const [isGuest, setIsGuest] = useState(false); // 비회원 상태 관리
  const [username, setUsername] = useState(''); // 로그인한 유저의 이름
  const [role, setRole] = useState(''); // 로그인한 유저의 역할
  const navigate = useNavigate();

  // 로그인 상태 확인 및 상태 업데이트
  useEffect(() => {
    const guestLogin = sessionStorage.getItem('guestLogin'); // sessionStorage로 비회원 로그인 확인
    const loggedUsername = localStorage.getItem('username'); // localStorage에서 username 가져오기
    const loggedRole = localStorage.getItem('role'); // localStorage에서 role 가져오기

    if (guestLogin === 'true') {
      setIsGuest(true);
    } else if (loggedUsername) {
      setUsername(loggedUsername);
      setRole(loggedRole);
    }
  }, []);

  const handleLogout = () => {
    setIsGuest(false);
    setUsername(''); // 유저 이름 초기화
    setRole(''); // 역할 초기화
    sessionStorage.removeItem('guestLogin'); // 로그아웃 시 비회원 상태 제거
    localStorage.removeItem('username'); // 로그아웃 시 username 제거
    localStorage.removeItem('role'); // 로그아웃 시 role 제거
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
          {isGuest ? (
            <>
              <li>Guest님</li> {/* 비회원 상태일 때 표시 */}
              <li>
                <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>로그아웃</button>
              </li>
            </>
          ) : username ? (
            <>
              <li>{`${username}님`}</li> {/* 로그인한 사용자 이름 표시 */}
              <li>
                <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>로그아웃</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">로그인</Link></li> {/* 로그인 버튼은 비회원 상태가 아닐 때만 표시 */}
              <li><Link to="/signup">회원가입</Link></li>
            </>
          )}
          <li><Link to="/qna">Q&A</Link></li>
          <li><Link to="/mypage">마이페이지</Link></li>
          <li><Link to="/cart">장바구니</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
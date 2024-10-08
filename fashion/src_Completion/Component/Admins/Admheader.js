import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 훅 사용
import '../../CSS/Admheader.css';

const Admheader = () => {
  const navigate = useNavigate();

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // localStorage와 sessionStorage에서 로그인 정보 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    sessionStorage.removeItem('guestLogin');

    // 로그아웃 후 홈페이지로 이동
    navigate('/');
  };

  return (
    <div className="adm-page">
      {/* 좌측 사이드바 */}
      <aside className="adm-sidebar">
        <h1 className="adm-logo">TREND FLOW</h1>
        <div className="adm-user-info">
          <p>
            <span className="adm-username">[관리자]님</span> {/* 관리자 이름 표시 */}
            <button
              onClick={handleLogout}
              className="adm-logout-button" // CSS로 스타일을 적용
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}
            >
            </button>
          </p>
        </div>

        <div className="adm-user-site">
          <a href="/">
            사이트 바로가기 <FontAwesomeIcon icon={faRightFromBracket} className="icon-space" />
          </a>
        </div>

        <div>
          <h5 className="adm-text">사이트 관리</h5>
        </div>

        <nav className="adm-nav">
          <ul>
            <li>
              <a href="/manager">
                 대시보드
              </a>
            </li>
            <li>
              <a href="/storemanage">
                 매장관리
              </a>
            </li>
            <li>
              <a href="/managers">
                 기타관리
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default Admheader;
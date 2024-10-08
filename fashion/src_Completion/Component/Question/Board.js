import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Board.css';

const Board = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [boardType, setBoardType] = useState('전체'); // 변경: categoryFilter -> boardType
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [qnaData, setQnaData] = useState([]);
  const itemsPerPage = 15;

  useEffect(() => {
    const guestLogin = sessionStorage.getItem('guestLogin') === 'true';
    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    if (guestLogin) setIsGuest(true);
    if (accessToken) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    // API를 사용하여 Q&A 데이터를 가져옵니다.
    fetch('http://10.125.121.188:8080/api/qboards')
      .then((response) => {
        if (!response.ok) {
          throw new Error('데이터를 가져오는 데 실패했습니다.');
        }
        return response.json();
      })
      .then((data) => {
        const sortedData = data.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
        console.log('Q&A 데이터 (최신순):', sortedData);
        setQnaData(sortedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const filteredData = boardType === '전체'
    ? qnaData
    : qnaData.filter((item) => item.boardType === (boardType === '상품문의' ? 'ProductQnA' : 'EtcQnA'));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleWriteClick = () => {
    if (!isGuest && !isLoggedIn) {
      setShowModal(true);
      return;
    }
    navigate('/write');
  };

  const handleRowClick = (id) => {
    if (!isGuest && !isLoggedIn) {
      setShowModal(true);
      return;
    }
    navigate(`/qna/${id}`);
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/login');
  };

  return (
    <div className="qna-board-container">
      <h2 className="qna-board-title">Q&A</h2>
      <p className="qna-board-description">
        상품에 대한 문의 및 사이트 이용 등 기타 문의를 받습니다.
      </p>
      <p className="qna-board-notice">
        *상품에 대한 답변의 업무 시간은 최대한 빠르게 답변드리겠습니다만, 급한 문의 시 연락 주세요.
      </p>

      <div className="qna-board-button-group">
        <button onClick={() => setBoardType('전체')}>전체문의</button>
        <button onClick={() => setBoardType('상품문의')}>상품문의</button>
        <button onClick={() => setBoardType('기타문의')}>기타문의</button>
      </div>

      <div className={`qna-board-table-wrapper ${!isGuest && !isLoggedIn ? 'blurred' : ''}`}>
        <table className="qna-board-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={`${item.id}-${index}`} // `index`를 추가하여 고유한 key 값 생성
                onClick={() => handleRowClick(item.id)} // `item.id`로 수정
                style={{ cursor: 'pointer' }}
              >
                <td>{item.id}</td>
                <td>{item.boardType === 'ProductQnA' ? '상품문의' : '기타문의'}</td> {/* boardType 값에 따라 한글로 표시 */}
                <td>
                  {index === 0 && (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>[NEW] </span>
                  )}
                  {item.title}
                </td>
                <td>{item.member?.name || '알 수 없음'}</td>
                <td>{new Date(item.createDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="qna-board-actions">
        {(isGuest || isLoggedIn) && userRole !== 'GUEST' && (
          <button onClick={handleWriteClick}>작성</button>
        )}
      </div>

      <div className="qna-board-pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="prev-next-btn"
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="prev-next-btn"
        >
          다음
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>로그인 또는 비회원 로그인이 필요합니다.</p>
            <button onClick={closeModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko';
import '../../CSS/MyOrder.css';

registerLocale('ko', ko);

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(5);

  const [userRole, setUserRole] = useState(''); 
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // sessionStorage에서 주문 데이터 불러오기
    const storedOrderItems = JSON.parse(sessionStorage.getItem('orderItems')) || [];
    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo')) || {};
    const orderNumber = orderInfo.orderNumber || 'N/A';
    const orderDate = orderInfo.orderDate || new Date().toLocaleDateString();
    const orderStatus = '배송 중';

    const formattedOrders = storedOrderItems.map((item, index) => ({
      id: orderNumber + '-' + (index + 1),
      product: item.name,
      price: `${(item.price * item.quantity).toLocaleString()}원`, // 숫자를 그대로 사용하여 금액 계산
      date: orderDate,
      status: orderStatus,
      size: item.size,
      quantity: item.quantity,
    }));

    setOrders(formattedOrders);
    setFilteredOrders(formattedOrders);

    // 로그인 상태 및 역할 체크
    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const guestLogin = sessionStorage.getItem('guestLogin') === 'true';

    if (accessToken) {
      setIsLoggedIn(true);
      setUserRole(role);
    } else if (guestLogin) {
      setIsGuest(true);
      setUserRole('GUEST');
    }
  }, []);

  const handleSearch = () => {
    const lowerCasedSearchTerm = searchTerm.toLowerCase();

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.date);
      const isWithinDateRange =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);

      const matchesProduct = order.product.toLowerCase().includes(lowerCasedSearchTerm);

      return isWithinDateRange && matchesProduct;
    });

    setFilteredOrders(filtered);
    setVisibleOrdersCount(5);
  };

  const handleShowMore = () => {
    setVisibleOrdersCount((prevCount) => prevCount + 5);
  };

  const dayClassName = (date) => {
    const day = date.getDay();
    if (day === 6) return 'saturday';
    if (day === 0) return 'sunday';
    return '';
  };

  return (
    <div className="myorder-container">
      <h2 className="myorder-title">주문/배송 내역</h2>
      <p className="myorder-subtitle">나의 주문/배송 내역을 확인해보세요.</p>

      <div className="myorder-user-info">
        <div className="myorder-avatar">
          <FontAwesomeIcon icon={faUser} size="2x" />
        </div>
        {/* 로그인 상태에 따른 메시지 표시 */}
        {isGuest ? (
          <p className="myorder-no-orders">
            <strong>[Guest]</strong>님의 주문/배송 내역입니다.<br />
            <strong>
              <Link to="/mypage" style={{ color: 'black' }}>여기</Link>
            </strong>를 클릭하면 마이페이지로 이동합니다.
          </p>
        ) : isLoggedIn && userRole === 'ADMIN' ? (
          <p className="myorder-no-orders">
            <strong>[관리자]</strong>님의 주문/배송 내역입니다.<br />
            <strong>
              <Link to="/mypage" style={{ color: 'black' }}>여기</Link>
            </strong>를 클릭하면 마이페이지로 이동합니다.
          </p>
        ) : (
          <p className="myorder-no-orders">
            <strong>[회원]</strong>님의 주문/배송 내역입니다.<br />
            <strong>
              <Link to="/mypage" style={{ color: 'black' }}>여기</Link>
            </strong>를 클릭하면 마이페이지로 이동합니다.
          </p>
        )}
      </div>

      <div className="myorder-section-header">주문/배송 내역 조회</div>
      <div className="myorder-search-section">
        <div className="input-with-icon">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            onClickOutside={() => setStartDateOpen(false)}
            onSelect={() => setStartDateOpen(false)}
            open={startDateOpen}
            dateFormat="yyyy-MM-dd"
            locale="ko"
            placeholderText="시작 날짜를 선택하세요."
            className="myorder-input"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            dayClassName={dayClassName}
          />
          <FontAwesomeIcon
            icon={faCalendar}
            className="calendar-icon calendar-icon-left"
            onClick={() => setStartDateOpen(!startDateOpen)}
          />
        </div>
        <span className="date-separator">~</span>
        <div className="input-with-icon">
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            onClickOutside={() => setEndDateOpen(false)}
            onSelect={() => setEndDateOpen(false)}
            open={endDateOpen}
            dateFormat="yyyy-MM-dd"
            locale="ko"
            placeholderText="종료 날짜를 선택하세요."
            className="myorder-input"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            dayClassName={dayClassName}
          />
          <FontAwesomeIcon
            icon={faCalendar}
            className="calendar-icon calendar-icon-right"
            onClick={() => setEndDateOpen(!endDateOpen)}
          />
        </div>
        <input
          type="text"
          className="myorder-input product-name-input"
          placeholder="상품명을 입력하세요."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="myorder-search-btn" onClick={handleSearch}>조회</button>
      </div>

      <div className="myorder-section-header">주문/배송 내역 목록</div>
      {filteredOrders.length > 0 ? (
        <table className="myorder-table">
          <thead>
            <tr>
              <th>주문 번호</th>
              <th>상품 정보</th>
              <th>총 가격</th>
              <th>주문 일자</th>
              <th>배송 상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.slice(0, visibleOrdersCount).map((order, index) => (
              <tr key={index}>
                <td>{order.id}</td>
                <td>
                  <div className="myorder-product-info">
                    <div className="myorder-product-img-placeholder"></div>
                    <div className="myorder-text">
                      <p>{order.product}</p>
                      <p>사이즈: {order.size}</p>
                      <p>수량: {order.quantity}개</p>
                    </div>
                  </div>
                </td>
                <td>{order.price}</td>
                <td>{order.date}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="myorder-no-orders">주문 내역이 없습니다.</p>
      )}

      {filteredOrders.length > visibleOrdersCount && (
        <div className="myorder-more-btn-container">
          <button className="myorder-more-btn" onClick={handleShowMore}>더보기</button>
        </div>
      )}
    </div>
  );
};

export default MyOrder;
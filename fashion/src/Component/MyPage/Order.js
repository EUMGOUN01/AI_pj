import React, { useState, useEffect } from 'react';
import '../../CSS/Order.css'; 
import { useNavigate } from 'react-router-dom';

const Order = () => {
  const navigate = useNavigate();
  
  // 날짜 형식을 원하는 포맷으로 변환하는 함수
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 두 자리 숫자로 표시
    const day = String(date.getDate()).padStart(2, '0'); // 두 자리 숫자로 표시
    return `${year}.${month}.${day}`;
  };

  // 주문 내역 데이터를 관리하는 상태
  const [orderItems, setOrderItems] = useState([]);
  const [orderInfo, setOrderInfo] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    orderDate: '',
    request: '',
  });

  // sessionStorage에서 주문 데이터를 불러오는 함수
  useEffect(() => {
    // sessionStorage에서 데이터 불러오기
    const storedOrderItems = JSON.parse(sessionStorage.getItem('orderItems')) || [];
    const storedOrderInfo = JSON.parse(sessionStorage.getItem('orderInfo')) || {
      recipientName: '홍길동', // 배송지명을 기본값으로 설정
      phoneNumber: '010-0000-0000', // 목업 전화번호 기본값
      address: '서울특별시 강남구 테헤란로 123, 5층',
      orderDate: formatDate(new Date()), // 날짜를 YYYY.MM.DD 형식으로 변환
      request: '문 앞에 두고 가주세요.',
    };
    
    setOrderItems(storedOrderItems);
    setOrderInfo(storedOrderInfo);
  }, []);

  return (
    <div className="order-page-container">
      <h2 className="order-page-title">주문 내역</h2>
      <p className="order-page-subtitle">주문한 물건의 주문내역을 확인하세요.</p>

      {/* 주문 상품 목록 */}
      <div className="order-page-items">
        {orderItems.length > 0 ? (
          orderItems.map((item, index) => (
            <div key={index} className="order-page-item">
              <div className="order-page-item-shape"></div>
              <div className="order-page-item-details">
                <p className="order-page-item-name">{item.name}</p>
                <p className="order-page-item-price">
                  {(parseInt(item.price.replace(/,/g, '')) * item.quantity).toLocaleString()}원
                </p>
                <p className="order-page-item-quantity">수량: {item.quantity}</p>
                <p className="order-page-item-size">사이즈: {item.size}</p> {/* 사이즈 추가 */}
              </div>
            </div>
          ))
        ) : (
          <p>주문 내역이 없습니다.</p>
        )}
      </div>

      {/* 주문 정보 */}
      <div className="order-page-info">
        <h3 className="order-page-info-title">주문 정보</h3>
        <div className="order-page-info-details">
          <p><strong>주문자명:</strong> {orderInfo.recipientName}</p>
          <p><strong>전화번호:</strong> {orderInfo.phoneNumber}</p>
          <p><strong>주소:</strong> {orderInfo.address}</p>
          <p><strong>주문일자:</strong> {orderInfo.orderDate}</p>
          <p><strong>주문 요청사항:</strong> {orderInfo.request}</p>
        </div>
      </div>

      {/* 버튼 */}
      <div className="order-page-buttons">
        <button className="order-page-main-button" onClick={() => navigate('/')}>메인 홈 가기</button>
        <button className="order-page-mypage-button" onClick={() => navigate('/mypage')}>마이페이지</button>
      </div>
    </div>
  );
};

export default Order;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/PayCompleted.css';

const PayCompleted = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);


  useEffect(() => {
    // TODO
    if( sessionStorage.getItem('orderId')){
      setOrderNumber(sessionStorage.getItem('orderId'))
    }
    // 총 결제 금액을 sessionStorage에서 가져옴
    const storedTotalPrice = sessionStorage.getItem('totalPrice');
    if (storedTotalPrice) {
      setTotalPrice(parseInt(storedTotalPrice).toLocaleString()); // 쉼표 추가
    }
  }, []);

  const handleOrderCheck = () => {
    navigate('/order');
  };

  const handleMainPage = () => {
    sessionStorage.clear()
    navigate('/products'); // 메인 페이지로 이동
  };

  return (
    <div className="pay-comp-container">
      <h2 className="pay-comp-title">구매가 정상적으로 완료되었습니다.</h2>

      <div className="pay-comp-summary">
        <div className="pay-comp-order-number">
          <p>주문번호</p>
          <p className="pay-comp-order-value">{orderNumber}</p>
        </div>
        <div className="pay-comp-total-price">
          <p>총 결제 금액</p>
          <p className="pay-comp-price-value">{totalPrice}원</p>
        </div>
      </div>

      <p className="pay-comp-info">
        현재 주문한 상품의 정보는 <strong>{'['}마이페이지 {'>'} 주문 내역 확인하기{']'}</strong>에서
        상세한 주문 내역을<br />다시 확인 할 수 있습니다.
      </p>

      <div className="pay-comp-buttons">
        <button className="pay-comp-main-page-btn" onClick={handleMainPage}>메인 홈 가기</button>
        <button className="pay-comp-order-check-btn" onClick={handleOrderCheck}>
          주문 내역 확인하기
        </button>
      </div>
    </div>
  );
};

export default PayCompleted;
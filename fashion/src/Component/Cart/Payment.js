import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Payment.css';

const Payment = () => {
  const navigate = useNavigate();

  // 주문 상품 목록 상태 관리
  const [orderItems, setOrderItems] = useState([]);

  // 주소와 요청 사항 상태 관리
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [request, setRequest] = useState('');

  // 경고 메시지 상태 관리 (초기에는 false로 설정)
  const [recipientError, setRecipientError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  // sessionStorage에서 선택된 상품 데이터를 가져와서 주문 목록에 저장
  useEffect(() => {
    const selectedItems = JSON.parse(sessionStorage.getItem('selectedItems')) || [];
    setOrderItems(selectedItems);
  }, []);

  // 주문 번호 생성 함수
  const generateOrderNumber = () => {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5자리 랜덤 숫자 생성
  };

  const handlePaymentSubmit = () => {
    let valid = true;

    // 유효성 검사: 필수 입력 항목 체크
    if (recipientName === '') {
      setRecipientError(true);
      valid = false;
    } else {
      setRecipientError(false);
    }

    if (phoneNumber === '') {
      setPhoneError(true);
      valid = false;
    } else {
      setPhoneError(false);
    }

    if (address === '') {
      setAddressError(true);
      valid = false;
    } else {
      setAddressError(false);
    }

    // 모든 입력이 유효할 경우 결제 완료 페이지로 이동
    if (valid) {
      const totalPrice = calculateTotalPrice();
      const orderDate = new Date().toLocaleDateString();

      // 주문 번호 생성
      const orderNumber = generateOrderNumber();

      const orderInfo = {
        orderNumber,
        recipientName,
        phoneNumber,
        address,
        request,
        userId: 'mockUser',
        orderDate,
      };

      // sessionStorage에 데이터 저장
      sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo));
      sessionStorage.setItem('orderItems', JSON.stringify(orderItems));
      sessionStorage.setItem('totalPrice', totalPrice);

      // 결제 완료 페이지로 이동
      navigate('/paycompleted');
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNewAddress = () => {
    setAddress('');
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
    sessionStorage.setItem('selectedItems', JSON.stringify(updatedItems));
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((acc, item) => {
      const price = item.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="payment-page-container">
      <h1 className="payment-page-title">주문/결제</h1>
      <p className="payment-page-subtitle">주문상품 및 결제정보를 확인해주세요.</p>

      {/* 주문 상품 정보 */}
      <div className="payment-order-info">
        <h2>주문 상품정보</h2>
        {orderItems.length > 0 ? (
          orderItems.map((item) => (
            <div key={item.productId} className="payment-order-item">
              <div className="payment-order-item-image-placeholder">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={`http://10.125.121.188:8080${item.images[0]}`}
                    alt={item.name}
                    className="payment-order-item-image"
                    onError={(e) => (e.target.src = '/images/default-placeholder.png')}
                  />
                ) : (
                  <img
                    src="/images/default-placeholder.png"
                    alt="Placeholder"
                    className="payment-order-item-image"
                  />
                )}
              </div>
              <div className="payment-order-item-details">
                <p className="payment-order-item-name">{item.name}</p>
                <p className="payment-order-item-price">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
                <p className="payment-order-item-quantity">수량: {item.quantity}개</p>
                <p className="payment-order-item-size">사이즈: {item.size}</p>
              </div>
              <button className="remove-item-btn" onClick={() => handleRemoveItem(item.productId)}>
                x
              </button>
            </div>
          ))
        ) : (
          <p>주문하신 상품이 없습니다.</p>
        )}
      </div>

      {/* 배송지 정보 */}
      <div className="payment-delivery-info">
        <h2>배송지 정보</h2>
        <h3>주문자</h3>
        <input
          type="text"
          className={`payment-input-fields ${recipientError ? 'input-error' : ''}`}
          placeholder={recipientError ? '주문자명을 입력해주세요.' : '주문자명을 입력하세요.'}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        <h3>휴대폰 번호</h3>
        <input
          type="tel"
          className={`payment-input-fields ${phoneError ? 'input-error' : ''}`}
          placeholder={phoneError ? '휴대폰 번호를 입력해주세요.' : '휴대폰 번호를 입력하세요.'}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <h3>주소</h3>
        <input
          type="text"
          className={`payment-input-fields ${addressError ? 'input-error' : ''}`}
          placeholder={addressError ? '주소를 입력해주세요.' : '주소를 입력하세요.'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className="add-address-btn" onClick={handleNewAddress}>새로운 주소 입력</button>
      </div>

      {/* 주문 요청 사항 */}
      <div className="payment-request-info">
        <h2>주문 요청 사항</h2>
        <select 
          className="payment-input-fields" 
          value={request} 
          onChange={(e) => setRequest(e.target.value)}
        >
          <option value="">요청 사항을 선택하세요.</option>
          <option value="문앞에 두고가주세요.">문앞에 두고가주세요.</option>
          <option value="경비실에 맡겨주세요.">경비실에 맡겨주세요.</option>
          <option value="부재 시 핸드폰으로 연락주세요.">부재 시 핸드폰으로 연락주세요.</option>
          <option value="배송 전 연락해주세요.">배송 전 연락해주세요.</option>
          <option value="택배 보관함에 보관해주세요.">택배 보관함에 보관해주세요.</option>
          <option value="직접 입력">직접 입력</option>
        </select>
        {request === '직접 입력' && (
          <input 
            type="text" 
            className="payment-input-fields" 
            placeholder="요청 사항을 직접 입력하세요." 
            value={request} 
            onChange={(e) => setRequest(e.target.value)} 
          />
        )}
      </div>

      {/* 결제 수단 */}
      <div className="payment-method-info">
        <h2>결제 수단</h2>
        <div className="payment-method-options">
          <div className="payment-method-option">신용카드</div>
          <div className="payment-method-option">가상계좌</div>
          <div className="payment-method-option">휴대폰 결제</div>
          <div className="payment-method-option">토스 페이</div>
          <div className="payment-method-option">카카오 페이</div>
        </div>
      </div>

      {/* 최종 결제 금액 */}
      <div className="payment-summary-info">
        <div className="payment-summary-item">
          <span>상품 가격</span>
          <span>{calculateTotalPrice().toLocaleString()}원</span>
        </div>
        <div className="payment-summary-item">
          <span>배송비</span>
          <span>무료 배송</span>
        </div>
        <div className="payment-summary-total">
          <span>총 결제 금액</span>
          <span>{calculateTotalPrice().toLocaleString()}원</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="payment-buttons">
        <button className="payment-cancel-btn" onClick={handleCartClick}>장바구니</button>
        <button className="payment-submit-btn" onClick={handlePaymentSubmit}>
          결제하기
        </button>
      </div>
    </div>
  );
};

export default Payment;
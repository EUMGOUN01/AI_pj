import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Payment.css';
import { fetchAPI } from '../../hook/api';
import AddressInput from '../Payment/AddressInput ';
import usePayment from '../Payment/usePayment';
import ReactGA from 'react-ga4';

const Payment = () => {
  const navigate = useNavigate();
  const { handlePayment } = usePayment(); // 커스텀 훅 사용

  // 주문 상품 목록 상태 관리
  const [orderItems, setOrderItems] = useState([]);

  // 주소와 요청 사항 상태 관리
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState(''); // 주소
  const [postcode, setPostcode] = useState(''); // 우편번호
  const [detailedAddress, setDetailedAddress] = useState(''); // 상세주소 (새로 추가)
  const [request, setRequest] = useState('');


  // 경고 메시지 상태 관리
  const [recipientError, setRecipientError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  // 각 필드의 ref 생성
  const recipientNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const addressRef = useRef(null);

  // 카카오 주소 API 호출 함수
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        // 검색된 주소 정보를 설정
        setAddress(data.address); // 주소 설정
        setPostcode(data.zonecode);   // 우편번호 설정
      },
    }).open();
  };
  
  const postOrder = async (endpoint, data) => {
    try {
      // fetchAPI를 활용하여 POST 요청
      const responseData = await fetchAPI(`orders${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data), // 데이터를 JSON 문자열로 변환
      });
      return responseData;
    } catch (error) {
      console.error('Error during order submission:', error);
      throw error; // 필요에 따라 에러 처리
    }
  };

  // sessionStorage에서 선택된 상품 데이터를 가져와서 주문 목록에 저장
  useEffect(() => {
    const selectedItems = JSON.parse(sessionStorage.getItem('selectedItems')) || [];
    ReactGA.event('add_shipping_info')
    setOrderItems(selectedItems);
  }, []);

  // 휴대폰 번호 유효성 검사
  const isValidPhoneNumber = (number) => {
    const phoneRegex = /^\d{11}$/; // 11자리 숫자만 허용
    return phoneRegex.test(number);
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // 숫자가 아닌 값은 제거
    setPhoneNumber(input);
  };

  const handlePaymentSubmit = async () => {
    let valid = true;

    // 입력 유효성 검사 로직
    if (recipientName === '') {
      setRecipientError(true);
      recipientNameRef.current?.focus();
      valid = false;
      return;
    } else {
      setRecipientError(false);
    }

    if (phoneNumber === '' || !isValidPhoneNumber(phoneNumber)) {
      setPhoneError(true);
      phoneNumberRef.current?.focus();
      valid = false;
      return;
    } else {
      setPhoneError(false);
    }

    if (address === '') {
      setAddressError(true);
      addressRef.current?.focus();
      valid = false;
      return;
    } else {
      setAddressError(false);
    }
    if (valid) {
      const totalPrice = calculateTotalPrice();
      const orderInfo = {
        recipientName: recipientName,
        recipientPhone: phoneNumber,
        recipientAddress: `${address}, ${detailedAddress}`,
        recipientMessage: request,
        orderItems: orderItems,
        postCode : postcode
      };
      try {
        const completedOrder = await postOrder('/create', orderInfo);
        console.log(orderInfo)
        sessionStorage.setItem('orderId', completedOrder.orderId);
        sessionStorage.setItem('totalPrice', totalPrice);
        
        // 분리된 결제 처리 함수 호출
        await handlePayment(completedOrder);

      } catch (error) {
        console.error('Error processing order:', error);
      }
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = orderItems.filter((item) => item.productId !== productId);
    setOrderItems(updatedItems);
    sessionStorage.setItem('selectedItems', JSON.stringify(updatedItems));
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((acc, item) => {
      const price = item.price || 0;
      return acc + price * item.quantity;
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
                {item.pimgPath && item.pimgPath.length > 0 ? (
                  <img
                    src={`${process.env.REACT_APP_URL}${item.pimgPath}`}
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
          ref={recipientNameRef} // ref 추가
          className={`payment-input-fields ${recipientError ? 'input-error' : ''}`}
          placeholder={recipientError ? '주문자명을 입력해주세요.' : '주문자명을 입력하세요.'}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        <h3>휴대폰 번호</h3>
        <input
          type="tel"
          ref={phoneNumberRef} // ref 추가
          className={`payment-input-fields ${phoneError ? 'input-error' : ''}`}
          placeholder={phoneError ? '휴대폰 번호를 올바르게 입력해주세요.' : "01012341234"}
          value={phoneNumber}
          onChange={handlePhoneNumberChange} // 숫자만 입력되도록 수정된 핸들러 적용
        />


        {/* 주소 입력 컴포넌트 */}
        <AddressInput
          address={address}
          postcode={postcode}
          detailedAddress={detailedAddress}
          onSearchClick={handleAddressSearch}
          setDetailedAddress={setDetailedAddress}
        />
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

      {/* 결제 수단
      <div className="payment-method-info">
        <h2>결제 수단</h2>
        <div className="payment-method-options">
          <div className="payment-method-option">신용카드</div>
          <div className="payment-method-option">토스페이</div>
          <div className="payment-method-option">카카오페이</div>
          <div className="payment-method-option">네이버페이</div>
          <div className="payment-method-option">무통장입금</div>
        </div>
      </div> */}

      {/* 최종 결제 금액 */}
      <div className="payment-summary-info">
        <div className="payment-summary-item">
          <span>상품 가격</span>
          <span>{calculateTotalPrice().toLocaleString()}원</span>
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

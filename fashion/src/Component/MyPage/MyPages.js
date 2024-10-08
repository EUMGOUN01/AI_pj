import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTimes, faAngleLeft, faAngleRight, faCartShopping, faBox, faTruckMoving, faHouseChimney } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';
import '../../CSS/MyPages.css';

const MyPages = () => {
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); 
  const [isAdmin, setIsAdmin] = useState(false); 

  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [cartPage, setCartPage] = useState(1);   
  const [wishlistPage, setWishlistPage] = useState(1); 
  const itemsPerPage = 5; 

  useEffect(() => {
    const storedWishlist = JSON.parse(sessionStorage.getItem('wishlistItems')) || [];
    const storedCartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
    
    setWishlistItems(storedWishlist);
    setCartItems(storedCartItems);

    const guestLogin = sessionStorage.getItem('guestLogin');
    if (guestLogin === 'true') {
      setIsGuest(true);
    }

    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    
    if (accessToken && role) {
      setIsLoggedIn(true);
      setUserRole(role); 
      if (role === 'ADMIN') {
        setIsAdmin(true); 
      }
    } else {
      setIsLoggedIn(false);
      setUserRole('');
    }
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleRemoveWishlistItem = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.productId !== productId);
    setWishlistItems(updatedWishlist);
    sessionStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
  };

  const handleRemoveCartItem = (productId) => {
    const updatedCartItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCartItems);
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  };

  const handleNextCartPage = () => {
    setCartPage((prev) => prev + 1);
  };

  const handlePreviousCartPage = () => {
    setCartPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextWishlistPage = () => {
    setWishlistPage((prev) => prev + 1);
  };

  const handlePreviousWishlistPage = () => {
    setWishlistPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const indexOfLastCartItem = cartPage * itemsPerPage;
  const indexOfFirstCartItem = indexOfLastCartItem - itemsPerPage;
  const currentCartItems = cartItems.slice(indexOfFirstCartItem, indexOfLastCartItem);

  const indexOfLastWishlistItem = wishlistPage * itemsPerPage;
  const indexOfFirstWishlistItem = indexOfLastWishlistItem - itemsPerPage;
  const currentWishlistItems = wishlistItems.slice(indexOfFirstWishlistItem, indexOfLastWishlistItem);

  const handleCartClick = () => {
    if (isGuest || isLoggedIn) {
      navigate('/cart');
    } else {
      alert('로그인 또는 비회원 로그인이 필요합니다.');
    }
  };

  const handleOrdersClick = () => {
    if (isGuest || isLoggedIn) {
      navigate('/myorder');
    } else {
      alert('로그인 또는 비회원 로그인이 필요합니다.');
    }
  };

  useEffect(() => {
    console.log('Current wishlist items:', currentWishlistItems);
  }, [currentWishlistItems]);

  return (
    <div className="mypages-container">
      <h2 className="mypages-title">마이페이지</h2>
      <p className="mypages-subtitle">나의 정보 및 장바구니, 주문 내역을 확인해보세요.</p>

      {/* 사용자 정보 섹션 */}
      <div className="mypages-user-info">
        <div className="mypages-user-avatar">
          <FontAwesomeIcon icon={faUser} size="2x" />
        </div>
        <div className="mypages-user-details">
          {isGuest ? (
            <>
              <p className="mypages-user-message">[Guest]님 환영합니다.</p>
              <p className="mypages-user-status">
                게스트 이용자는 페이지를 닫으면 모든 정보가 초기화되니 유의해 주세요.
              </p>
            </>
          ) : isAdmin ? (
            <>
              <p className="mypages-user-message">관리자님 환영합니다.</p>
              <p className="mypages-user-status">
                관리자 권한으로 사이트를 이용하실 수 있습니다.
              </p>
            </>
          ) : isLoggedIn ? (
            <>
              <p className="mypages-user-message">[회원]님 환영합니다.</p>
              <p className="mypages-user-status">
                로그인 상태로 다양한 서비스를 이용하실 수 있습니다.
              </p>
            </>
          ) : (
            <>
              <p className="mypages-user-message">[로그인] 이후 이용 가능합니다.</p>
            </>
          )}
        </div>
      </div>

      {/* 진행 중인 주문 */}
      <div className="mypages-section-header">
        <h3 className="mypages-section-title">진행 중인 주문</h3>
        <p className="mypages-section-subtitle">최근 30일 내의 진행 중인 주문 정보가 표시됩니다.</p>
      </div>
      <div className="mypages-section-divider"></div>

      <div className="mypages-order-status">
        <div className="mypages-status-item">
          <div className="mypages-status-icon">
            <FontAwesomeIcon icon={faCartShopping} className="mypages-status-icon-inner" />
          </div>
          <p>발송 준비</p>
        </div>
        <div className="mypages-status-line"></div>
        <div className="mypages-status-item">
          <div className="mypages-status-icon">
            <FontAwesomeIcon icon={faBox} className="mypages-status-icon-inner" />
          </div>
          <p>배송 시작</p>
        </div>
        <div className="mypages-status-line"></div>
        <div className="mypages-status-item">
          <div className="mypages-status-icon">
            <FontAwesomeIcon icon={faTruckMoving} className="mypages-status-icon-inner" />
          </div>
          <p>배송 중</p>
        </div>
        <div className="mypages-status-line"></div>
        <div className="mypages-status-item">
          <div className="mypages-status-icon">
            <FontAwesomeIcon icon={faHouseChimney} className="mypages-status-icon-inner" />
          </div>
          <p>도착 예정</p>
        </div>
      </div>

      {/* 장바구니 및 주문 내역 버튼 */}
      <div className="mypages-order-buttons">
        <button className="mypages-btn" onClick={handleCartClick}>
          장바구니 목록 
        </button>
        <button className="mypages-btn" onClick={handleOrdersClick}>
          주문/배송 조회
        </button>
      </div>

      {/* 장바구니 */}
      <div className="mypages-section-header">
        <h3 className="mypages-section-title">장바구니</h3>
        <p className="mypages-section-subtitle">최근 30일 내의 진행 중인 장바구니 목록입니다.</p>
      </div>
      <div className="mypages-section-divider"></div>
      
      <div className="cart-items-container">
        <FontAwesomeIcon icon={faAngleLeft} onClick={handlePreviousCartPage} className="pagination-arrow left-arrow" />
        
        <div className="mypages-cart-items">
        {currentCartItems.length > 0 ? (
          currentCartItems.map(item => {
            const imageUrl = item.images && item.images.length > 0 
              ? `http://10.125.121.188:8080${item.images[0]}`
              : '/images/default-placeholder.png';
            
            return (
              <div key={item.productId} className="mypages-item" onClick={() => handleProductClick(item.productId)}>
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="mypages-item-placeholder"
                  onError={(e) => (e.target.src = '/images/default-placeholder.png')}
                />
                <div className="mypages-item-details">
                  <p className="mypages-item-name">{item.name}</p>
                  <p className="mypages-item-price">{item.price.toLocaleString()}원</p>
                </div>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="mypages-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCartItem(item.productId);
                  }}
                />
              </div>
            );
          })
        ) : (
          <p>장바구니에 담긴 상품이 없습니다.</p>
        )}
        </div>

        <FontAwesomeIcon icon={faAngleRight} onClick={handleNextCartPage} className="pagination-arrow right-arrow" />
      </div>

      {/* 찜 목록 */}
      <div className="mypages-section-header">
        <h3 className="mypages-section-title">찜 목록</h3>
        <p className="mypages-section-subtitle">최근 30일 내의 찜 목록입니다.</p>
      </div>
      <div className="mypages-section-divider"></div>
      
      <div className="wishlist-items-container">
        <FontAwesomeIcon icon={faAngleLeft} onClick={handlePreviousWishlistPage} className="pagination-arrow left-arrow" />
        
        <div className="mypages-wishlist-items">
        {currentWishlistItems.length > 0 ? (
          currentWishlistItems.map(product => {
            const imageUrl = `http://10.125.121.188:8080${product.pimgPath}`;

            return (
              <div key={product.productId} className="mypages-item" onClick={() => handleProductClick(product.productId)}>
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => (e.target.src = '/images/default-placeholder.png')} 
                />
                <div className="mypages-item-details">
                  <p className="mypages-item-name">{product.name}</p>
                  <p className="mypages-item-price">{product.price.toLocaleString()}원</p>
                </div>
                <FontAwesomeIcon
                  icon={faTimes}
                  className="mypages-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWishlistItem(product.productId);
                  }}
                />
              </div>
            );
          })
        ) : (
          <p>찜한 상품이 없습니다.</p>
        )}
        </div>

        <FontAwesomeIcon icon={faAngleRight} onClick={handleNextWishlistPage} className="pagination-arrow right-arrow" />
      </div>
    </div>
  );
};

export default MyPages;
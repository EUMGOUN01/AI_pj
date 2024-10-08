import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../CSS/ProductDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

import { fetchAPI } from '../../hook/api';
import ReactGA from 'react-ga4';

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('S');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 상태 추가

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const data = await fetchAPI(`/products/${productId}`);
        setProduct(data);
        // 찜 목록에 있는지 확인
        const storedWishlist = JSON.parse(sessionStorage.getItem('wishlistItems')) || [];
        const isLiked = storedWishlist.some(item => item.productId === data.productId);
        setLiked(isLiked);
      } catch (error) {
        console.error('상품 정보를 가져오는데 실패했습니다:', error);
      }
    };

    fetchProductDetails();

    const guestLogin = localStorage.getItem('username') === 'GUEST';
    const userLoggedIn = localStorage.getItem('accessToken') !== null;
    const userRole = localStorage.getItem('role'); // role 정보 가져오기

    setIsGuest(guestLogin);
    setIsLoggedIn(userLoggedIn);
    setIsAdmin(userRole === 'ADMIN');
  }, [productId]);
  
  const handleProductClick = (product) => {
    navigate(`/product/${product.productId}`);
    ReactGA.event("view_item", {
      items: [{
        item_id: product.productId,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }],
    });
  };

  const postCart = async (endpoint, data) => {
    try {
      const response = await fetchAPI(`/cart${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  const generateTransactionId = () => {
    return `txn_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  };
  // GA
  const trackBeginCheckout = (products, total) => {
    // 자동 생성된 transactionId
    const transactionId = generateTransactionId();
    sessionStorage.setItem('transactionId',transactionId)
    const items = products.map((product) => ({
      item_id: product.productId,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: quantity,
    }));
    ReactGA.event("begin_checkout", {
      transaction_id: transactionId,
      affiliation: "Trend Flow", // 매장 이름
      value: total,
      currency: 'KRW',
      shipping: 0,
      items: items,
    });
  };

  if (!product) {
    return <div>해당 제품을 찾을 수 없습니다.</div>;
  }

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isGuest && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    try {
      const response = await fetchAPI(`/products/${productId}/toggle-like`, {
        method: 'POST',
      });
      setLiked(!liked);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isGuest && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (isGuest) {
      const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
      const existingItem = cartItems.find(item => item.productId === product.productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.size = size;
      } else {
        cartItems.push({ ...product, productId, quantity, size });
      }
      sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
      setIsModalOpen(true);
    } else { // 회원일 때는 DB에 요청보내기
      const cartItem = [{ productId: productId, quantity: quantity, size: size, }]; // 서버에 보낼 데이터
      postCart('/add', cartItem)
        .then((response) => {
          console.log(response)
          setIsModalOpen(true);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    // GA 장바구니 추가 트래킹
    ReactGA.event('add_to_cart', {
      items: [{
        item_id: product.productId,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity,
        currency: "KRW",        // 통화 코드
      }],
    });
  };

  const handleBuyNow = () => {
    if (!isGuest && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const selectedItem = [{ ...product, quantity, size }];
    sessionStorage.setItem('selectedItems', JSON.stringify(selectedItem));
    // GA 구매 트래킹
    const total = product.price * quantity;  // 총 금액 계산
    trackBeginCheckout(selectedItem, total)
    navigate('/payment');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmModal = () => {
    navigate('/cart');
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  // 이미지 URL 생성
  const imageUrl = product.pimgPath && product.pimgPath.length > 0
    ? `${process.env.REACT_APP_URL}${product.pimgPath}`
    : 'default-image-path.jpg';

  return (
    <div className="product-details-wrapper">
      <div className="product-details-page">
        <div className="product-details-page-image">
          <img src={imageUrl} alt={product.name} className="product-image" />
        </div>
        <div className="product-details-page-info">
          <div className="product-title">
            <h2>{product.name}</h2>
            <div className="wishlist-icon" onClick={handleLike}>
              <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} style={{ color: liked ? '#FA5858' : 'black' }} />
            </div>
          </div>
          <div className="product-details-page-price">
            <span>가격 </span>
            <strong>{product.price.toLocaleString()}</strong>
            <span>원</span>
          </div>
          <div className="product-details-page-shipping">
            <p>배송 정보: <span>3일 이내 출고</span></p>
            <p>배송비: <span>무료배송</span></p>
          </div>

          <div className="product-details-page-size">
            <span>사이즈 </span>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="FREE">FREE</option>
            </select>
          </div>

          <div className="product-details-page-quantity">
            <span>수량</span>
            <div className="product-details-page-quantity-controls">
              <button onClick={() => handleQuantityChange(quantity - 1)}>-</button>
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                style={{ textAlign: 'center' }}
              />
              <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
            </div>
          </div>
          <div className="product-details-page-buttons">
            <button className="product-details-page-add-to-cart" onClick={handleAddToCart}>
              장바구니 담기
            </button>
            <button className="product-details-page-buy-now" onClick={handleBuyNow}>
              바로 구매하기
            </button>
          </div>
        </div>
      </div>

      {/* 상품정보 */}
      <div className="product-details-page-additional-infos">
        <hr />
        <p><strong>상품정보</strong></p>
        <p>상품번호: {product.productId}</p>
        <p>상품등록일: 20140612</p>
      </div>

      {/* AI 추천 영역 추가 */}
      <div className="product-details-page-ai-recommendation">
        <hr />
        <p><strong>AI 추천</strong></p>
        <div className="ai-recommendation-shapes">
          {product.randomRecommendations.map((recommendation) => (
            <div key={recommendation.productId} className="shape-placeholder-wrapper"
            onClick={() => handleProductClick(recommendation)}>
              {/* Display the image */}
              <img
                src={process.env.REACT_APP_URL + recommendation.pimgPath}
                alt={recommendation.name}
                className="ai-recommendation-image"
              />
              {/* Display the product name */}
              <p className="item-title">{recommendation.name}</p>
              {/* Display the product price */}
              <p className="item-price">{recommendation.price.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      </div>


      {/* 배송 정보 */}
      <div className="product-details-page-additional-infos">
        <hr />
        <p><strong>배송 정보</strong></p>
        <p>천재지변, 택배사 사정 등으로 인한 배송 지연 시 개별 안내 드립니다.</p>
        <p>배송 중 상품이 손상되었거나 분실된 경우, 고객센터로 즉시 연락해 주시기 바랍니다.</p>
        <p>제주도 및 도서산간 지역도 추가 배송비 없이 배송됩니다. 단, 배송이 1-2일 추가 소요될 수 있습니다.</p>
      </div>

      {/* 교환 및 반품 안내 */}
      <div className="product-details-page-additional-infoss">
        <hr />
        <p><strong>교환 및 반품 안내</strong></p>
        <p>배송 받은 날로부터 7일 이내에 교환 및 반품 가능 (단, 미사용 상태 및 태그가 부착된 상태이어야 함)</p>
        <p>제품 불량이나 오배송의 경우, 교환 및 반품 배송비는 판매자가 부담합니다.</p>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>상품이 장바구니에 성공적으로 담겼습니다.</p>
            <div className="modal-buttons">
              <button onClick={handleCloseModal}>닫기</button>
              <button onClick={handleConfirmModal}>확인</button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>로그인 또는 비회원 로그인이 필요합니다.</p>
            <button onClick={closeLoginModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
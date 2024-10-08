import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../CSS/Product.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const itemsPerPage = 25;
const categories = [
  { ko: '전체', en: 'All' },
  { ko: '가디건', en: 'Cardigan' },
  { ko: '니트웨어', en: 'Knitwear' },
  { ko: '드레스', en: 'Dress' },
  { ko: '레깅스', en: 'Leggings' },
  { ko: '베스트', en: 'Vest' },
  { ko: '블라우스', en: 'Blouse' },
  { ko: '셔츠', en: 'Shirts' },
  { ko: '스커트', en: 'Skirt' },
  { ko: '재킷', en: 'Jacket' },
  { ko: '점퍼', en: 'Jumper' },
  { ko: '점프수트', en: 'Jumpsuit' },
  { ko: '조거팬츠', en: 'Jogger Pants' },
  { ko: '질업', en: 'Zipper' },
  { ko: '청바지', en: 'Jeans' },
  { ko: '코트', en: 'Coat' },
  { ko: '탑', en: 'Top' },
  { ko: '티셔츠', en: 'T-shirt' },
  { ko: '패딩', en: 'Padding' },
  { ko: '팬츠', en: 'Pants' },
  { ko: '후드티', en: 'Hoodie' }
];

const Product = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortOption, setSortOption] = useState('productPriceHigh'); // 정렬 옵션 상태
  const [productList, setProductList] = useState([]); // 상품 목록 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
  const navigate = useNavigate();

  useEffect(() => {
    // 상품 데이터 가져오기
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://10.125.121.188:8080/api/products?page=${currentPage}&size=${itemsPerPage}&sort=${sortOption}`);
        if (!response.ok) {
          throw new Error('상품 데이터를 가져오는데 실패했습니다');
        }
        const data = await response.json();
        setProductList(data.content); // API 응답의 'content' 배열 사용
        setTotalPages(data.totalPages); // 전체 페이지 수 업데이트
      } catch (error) {
        console.error('상품 데이터를 가져오는데 실패했습니다:', error);
      }
    };

    fetchProducts();

    const guestLogin = sessionStorage.getItem('guestLogin') === 'true';
    const userLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
    
    if (guestLogin || userLoggedIn) {
      setIsGuest(guestLogin);
      setIsLoggedIn(userLoggedIn);

      const storedWishlist = JSON.parse(sessionStorage.getItem('wishlistItems')) || [];
      setWishlist(storedWishlist);
    }
  }, [currentPage, sortOption]); // currentPage와 sortOption이 변경될 때마다 fetchProducts 호출

  const toggleWishlist = (productId) => {
    if (!isGuest && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const updatedWishlist = [...wishlist];
    const index = updatedWishlist.findIndex(item => item.productId === productId);

    if (index > -1) {
      updatedWishlist.splice(index, 1);
    } else {
      const product = productList.find(item => item.productId === productId);
      updatedWishlist.push(product);
    }

    setWishlist(updatedWishlist);
    sessionStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));

    // likeCount 업데이트
    const updatedProductList = productList.map(product => {
      if (product.productId === productId) {
        return {
          ...product,
          likeCount: product.likeCount + (index > -1 ? -1 : 1) // 하트를 눌렀다면 감소, 눌리지 않았다면 증가
        };
      }
      return product;
    });

    setProductList(updatedProductList);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCategorySelect = (categoryKo) => {
    setSelectedCategory(categoryKo);
    setCurrentPage(1);
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // 정렬을 변경할 때 페이지를 1로 초기화
  };

  // 현재 페이지에서 보여줄 상품 필터링
  const filteredProductList = selectedCategory === '전체'
    ? productList
    : productList.filter(product => product.category === selectedCategory);

  return (
    <div className="product-page">
      <PageTitle title="전체 상품" />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} setSelectedCategory={handleCategorySelect} />

      {/* 정렬 드롭다운 추가 */}
      <div className="sort-dropdown">
        <label htmlFor="sort"></label>
        <select id="sort" value={sortOption} onChange={handleSortChange}>
          <option value="productPriceHigh">가격 높은순</option>
          <option value="productPriceLow">가격 낮은순</option>
          <option value="likeCount">인기순</option>
        </select>
      </div>

      <div className="product-grid">
        {filteredProductList.map((product) => {
          const liked = wishlist.some(item => item.productId === product.productId);
          const imageUrl = `http://10.125.121.188:8080${product.pimgPath}`;
          return (
            <div 
              key={product.productId} 
              className="product-card" 
              onClick={() => handleProductClick(product.productId)}
            >
              <img src={imageUrl} alt={product.name} className="product-image" />
              <h2 className="product-name">{product.name}</h2>
              <div className="product-price-wrapper">
                <p className="product-price">{product.price.toLocaleString()}원</p>
                <div className="wishlist-icon" onClick={(e) => { e.stopPropagation(); toggleWishlist(product.productId); }}>
                  <FontAwesomeIcon 
                    icon={liked ? solidHeart : regularHeart} 
                    style={{ color: liked ? '#FA5858' : 'black' }}
                  />
                  <span className="like-count">{product.likeCount}</span> {/* 좋아요 수 표시 */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>이전</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
      </div>

      {/* 로그인 모달 */}
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

// 타이틀 컴포넌트
const PageTitle = ({ title }) => <h1 className="page-title">{title}</h1>;

// 카테고리 바 컴포넌트
const CategoryBar = ({ categories, selectedCategory, setSelectedCategory }) => (
  <div className="category-bar">
    {categories.map((category, index) => (
      <span
        key={index}
        className={`category-item ${selectedCategory === category.ko ? 'active' : ''}`}
        onClick={() => setSelectedCategory(category.ko)} // 한국어 이름을 전달하도록 수정
      >
        {category.ko} / {category.en} {/* 한국어와 영어를 같이 표시 */}
      </span>
    ))}
  </div>
);

export default Product;
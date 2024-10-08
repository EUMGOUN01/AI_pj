import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Product.css';
import { fetchAPI } from '../../hook/api'; // API 호출하는 함수
import Modal from '../Util/Modal';
import CategoryBar from '../Util/CategoryBar';
import Pagination from '../Util/Pagination';
import { useToggleLike } from '../../hook/useToggleLike';
import ReactGA from 'react-ga4';
import ProductCard from './ProductCard';

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
  { ko: '짚업', en: 'Zipper' },
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sortOption, setSortOption] = useState('likeCount'); // 정렬 옵션 상태
  const [productList, setProductList] = useState([]); // 상품 목록 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
  const [fetchError, setFetchError] = useState(null); // fetch 에러 상태
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `products?page=${currentPage}&size=${itemsPerPage}&sort=${sortOption}`;
        url = selectedCategory === '전체' ? url : `${url}&category=${selectedCategory}`;

        const data = await fetchAPI(url);
        setProductList(data.content);
        setTotalPages(data.totalPages);
        setFetchError(null); // 성공적으로 데이터를 가져오면 에러 상태 초기화
      } catch (error) {
        console.error('상품 데이터를 가져오는 중 에러 발생:', error);
        setFetchError('상품 데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    fetchProducts();

    if (localStorage.getItem('username') === 'GUEST') {
      let storedWishlist = [];
      try {
        const wishlistFromStorage = sessionStorage.getItem('wishlistItems');
        if (wishlistFromStorage) {
          storedWishlist = JSON.parse(wishlistFromStorage);
        }
      } catch (error) {
        console.error("JSON 파싱 에러:", error);
      }
      setWishlist(storedWishlist);
    } 
    else if (localStorage.getItem('accessToken')) {
      const fetchWishList = async () => {
        try {
          const data = await fetchAPI(`auth/liked-products`);
          setWishlist(data);
        } catch (error) {
          console.error('위시리스트를 가져오는 중 에러 발생:', error);
          setFetchError('위시리스트를 불러오는 데 실패했습니다.');
        }
      };
      fetchWishList();
    }
  }, [currentPage, sortOption, selectedCategory]);

  const { toggleLike } = useToggleLike(wishlist, setWishlist, productList, setProductList);

  const handleProductClick = (product) => {
    navigate(`/product/${product.productId}`);
    ReactGA.event('view_item', {
      items: [
        {
          item_id: product.productId,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
        },
      ],
    });
  };

  const handleLikeClick = (productId) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setShowLoginModal(true); // 로그인이 안 되어 있을 경우 로그인 모달 표시
      return;
    }
    toggleLike(productId); // 로그인이 되어 있을 경우에만 좋아요 기능 호출
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <div className="product-page">
      <PageTitle title="전체 상품" />
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 정렬 드롭다운 추가 */}
      <div className="sort-dropdown">
        <label htmlFor="sort"></label>
        <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="productPriceHigh">가격 높은순</option>
          <option value="productPriceLow">가격 낮은순</option>
          <option value="likeCount">인기순</option>
        </select>
      </div>

      {/* 상품 목록 */}
      <div className="product-grid">
        {fetchError ? ( // 에러가 발생하면 에러 메시지 출력
          <div className="error-message">{fetchError}</div>
        ) : (
          productList.map((product) => {
            const liked = wishlist.some((item) => item.productId === product.productId);
            return (
              <ProductCard
                key={product.productId}
                product={product}
                liked={liked}
                handleProductClick={handleProductClick}
                handleLikeClick={handleLikeClick}
              />
            );
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage(currentPage - 1)}
        onNextPage={() => setCurrentPage(currentPage + 1)}
      />

      {/* 로그인 모달 */}
      {showLoginModal && (
        <Modal message="로그인이 필요합니다." onClose={closeLoginModal} />
      )}
    </div>
  );
};

const PageTitle = ({ title }) => <h1 className="page-title">{title}</h1>;

export default Product;

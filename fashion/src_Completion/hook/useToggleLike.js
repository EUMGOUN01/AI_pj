// hooks/useToggleLike.js
import { fetchAPI } from "./api";

export const useToggleLike = (wishlist, setWishlist, productList, setProductList) => {
  const toggleLike = async (productId, isGuest) => {
    if (!isGuest && !localStorage.getItem('accessToken')) {
      throw new Error('로그인이 필요합니다.');
    }

    // API 호출로 찜 상태를 변경
    if (localStorage.getItem('accessToken')) {
      const url = `${process.env.REACT_APP_API_URL}/products/${productId}/toggle-like`;
      const accessToken = localStorage.getItem('accessToken');

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken,
          },
        });
        if (!response.ok) {
          const errorMessage = `Failed to fetch: ${url}, Status: ${response.status}, ${response.statusText}`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('API 호출 실패:', error.message || error);
        throw error;
      }
    }
    // wishlist 업데이트
    const updatedWishlist = [...wishlist];
    const index = updatedWishlist.findIndex(item => item.productId === productId);
    if (index > -1) {
      updatedWishlist.splice(index, 1); // 찜 해제
    } else {
      const product = productList.find(item => item.productId === productId);
      updatedWishlist.push(product); // 찜 추가
    }
    setWishlist(updatedWishlist);
    sessionStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));

    // productList 업데이트 (likeCount 변경)
    const updatedProductList = productList.map(product =>
      product.productId === productId
        ? { ...product, likeCount: product.likeCount + (index > -1 ? -1 : 1) }
        : product
    );
    setProductList(updatedProductList);
  };

  return { toggleLike };
};

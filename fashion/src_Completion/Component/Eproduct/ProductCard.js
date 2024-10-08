import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const ProductCard = ({ product, liked, handleProductClick, handleLikeClick }) => {
  const imageUrl = `${process.env.REACT_APP_URL}${product.pimgPath}`;

  return (
    <div
      key={product.productId}
      className="product-card"
      onClick={() => handleProductClick(product)}
    >
      <img src={imageUrl} alt={product.name} className="product-image" />
      <h2 className="product-name">{product.name}</h2>
      <div className="product-price-wrapper">
        <p className="product-price">{product.price.toLocaleString()}원</p>
        <div
          className="wishlist-icon"
          onClick={(e) => {
            e.stopPropagation();
            handleLikeClick(product.productId);
          }}
        >
          <FontAwesomeIcon
            icon={liked ? solidHeart : regularHeart}
            style={{ color: liked ? '#FA5858' : 'black' }}
          />
          <span className="like-count">{product.likeCount}</span> {/* 좋아요 수 표시 */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

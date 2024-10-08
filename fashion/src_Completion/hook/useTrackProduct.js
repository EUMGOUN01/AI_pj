import { useCallback } from 'react';
import ReactGA from 'react-ga4';

/**
 * 상품 정보를 받아서 GA4 트래킹을 처리하는 훅
 * @param {object} product - 트래킹할 상품 정보
 * @returns {object} - 트래킹 이벤트를 호출하는 함수들
 */
const useTrackProduct = (product) => {
    // 상품 조회 트래킹 (상세 페이지 조회)
    const trackViewItem =() => {
        ReactGA.event({
            category: 'Ecommerce',
            action: 'view_item',
            label: product.name,
            value: product.price,
            nonInteraction: true,
            items: [{
                item_id: product.productId,
                item_name: product.name,
                item_category: product.category,
                price: product.price,
            }],
        });
        console.log("상품조회 트래킹")
    };

    // 장바구니 추가 트래킹
    const trackAddToCart = useCallback(() => {
        ReactGA.event({
            category: 'Ecommerce',
            action: 'add_to_cart',
            label: product.name,
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                item_category: product.category,
                price: product.price,
                quantity: product.quantity,
            }],
        });
        console.log("장바구니 트래킹")
    }, [product]);

    // 구매 시작 트래킹
    const trackCheckout = useCallback((transactionId, total) => {
        ReactGA.event({
            category: 'Ecommerce',
            action: 'begin_checkout',
            label: product.name,
            value: total,
            nonInteraction: true,
            transaction_id: transactionId,
            currency: 'KRW',
            items: [{
                item_id: product.id,
                item_name: product.name,
                item_category: product.category,
                price: product.price,
                quantity: product.quantity,
            }],
        });
    }, [product]);

    // 일반적인 GA 이벤트 트래킹
    const trackGAEvent = useCallback((action, label, value) => {
        ReactGA.event({
            category: 'Ecommerce',
            action: action, // 예: 'Button Click', 'Item Viewed'
            label: label || product.name, // 상품명 또는 사용자 행동을 설명하는 라벨
            value: value || product.price, // 예: 클릭당 가격 또는 다른 데이터 값
        });
    }, [product]);

    return {
        trackViewItem,
        trackAddToCart,
        trackPurchase: trackCheckout,
        trackGAEvent, // 일반 GA 이벤트 추가
    };
};

// export default useTrackProduct;

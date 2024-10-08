import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Baskets.css';
import Modal from '../Util/Modal';
import { fetchAPI } from '../../hook/api';
import ReactGA from 'react-ga4';



const Baskets = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    //TransactionID 만들기
    const generateTransactionId = () => {
        return `txn_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    };
    // GA
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
            quantity: product.quantity,
        }));
        ReactGA.event("begin_checkout", {
            transaction_id: transactionId,
            affiliation: "Trend Flow", // 매장 이름
            value: total,
            currency: 'KRW',
            shipping: 0,
            items: items,
        });
        console.log('Transaction ID:', transactionId);
    };



    useEffect(() => {
        const guestLogin = localStorage.getItem('username') === 'GUEST';
        const userLoggedIn = localStorage.getItem('accessToken') !== null;
        const userRole = localStorage.getItem('role'); // 역할 정보 가져오기

        if (!userId && userLoggedIn) {
            navigate('/login');
            return;
        }

        setIsGuest(guestLogin);
        setIsLoggedIn(userLoggedIn);
        setIsAdmin(userRole === 'ADMIN');

        if (userLoggedIn) {
            fetchCartItems();
        } else if (guestLogin) {
            const storedItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
            setItems(storedItems.map((item) => ({ ...item, isSelected: false })));
        } else {
            setShowLoginModal(true);
        }
    }, [navigate, userId]);

    // Fetch Cart Items
    const fetchCartItems = async () => {
        const data = await fetchAPI('/cart', { method: 'GET' });
        setItems(data.items.map((item) => ({
            ...item,
            isSelected: false,
            imageUrl: item.imageUrl,
            name: item.productName,
            quantity: item.quantity,
        })));
    };

    const totalPrice = items
        .filter((item) => item.isSelected)
        .reduce((acc, item) => acc + (parseInt(item.price, 10) || 0) * (parseInt(item.quantity, 10) || 1), 0);

    const handlePayment = () => {
        const selectedItems = items.filter((item) => item.isSelected);
        if (selectedItems.length === 0) {
            setShowModal(true);
        } else {
            if (isLoggedIn) {
                sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
                trackBeginCheckout(selectedItems, totalPrice)
                navigate('/payment');
            } else {
                setShowLoginModal(true);
            }
        }
    };

    const handleSelectAll = () => {
        setSelectAll((prevSelectAll) => {
            const newSelectAll = !prevSelectAll;
            setItems((prevItems) => prevItems.map((item) => ({ ...item, isSelected: newSelectAll })));
            return newSelectAll;
        });
    };

    const handleSelectItem = (id) => {
        setItems((prevItems) => {
            const updatedItems = prevItems.map((item) =>
                item.productId === id ? { ...item, isSelected: !item.isSelected } : item
            );
            setSelectAll(updatedItems.every((item) => item.isSelected));
            return updatedItems;
        });
    };

    const handleDeleteSelected = () => {
        const selectedItems = items.filter((item) => item.isSelected);
        const selectedIds = selectedItems.map((item) => item.productId);
        const remainingItems = items.filter((item) => !item.isSelected);

        setItems(remainingItems);

        if (isLoggedIn) {
            Promise.all(
                selectedIds.map((id) =>
                    fetchAPI(`/cart?productId=${encodeURIComponent(id)}`, { method: 'DELETE' })
                )
            ).catch((error) => console.error('Failed to delete one or more selected cart items:', error));
        } else if (isGuest) {
            sessionStorage.setItem('cartItems', JSON.stringify(remainingItems));
        }
    };

    const handleQuantityChange = (id, newQuantity) => {
        const updatedItems = items.map((item) =>
            item.productId === id && newQuantity >= 1 ? { ...item, quantity: newQuantity } : item
        );
        setItems(updatedItems);
        if (isLoggedIn) {
            fetchAPI('/cart/update', {
                method: 'PUT',
                body: JSON.stringify(updatedItems),
            }).catch((error) => console.error('Failed to update cart:', error));
        } else if (isGuest) {
            sessionStorage.setItem('cartItems', JSON.stringify(updatedItems));
        }
    };

    const handleDeleteItem = (id) => {
        const remainingItems = items.filter((item) => item.productId !== id);
        setItems(remainingItems);

        if (isLoggedIn) {
            fetchAPI(`?productId=${encodeURIComponent(id)}`, { method: 'DELETE' })
                .catch((error) => console.error('Failed to delete cart item:', error));
        } else if (isGuest) {
            sessionStorage.setItem('cartItems', JSON.stringify(remainingItems));
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const closeLoginModal = () => {
        setShowLoginModal(false);
        navigate('/login');
    };

    return (
        <div className="basket-container">
            <h1 className="basket-title">{isAdmin ? '관리자 장바구니' : '장바구니'}</h1>
            <p className="basket-description">{isAdmin ? '관리자 전용 상품 목록입니다.' : '판매자 설정에 따라, 개별 배송되는 상품이 있습니다.'}</p>
            {/* {items != [] ? '아이템 있음' : '아이템 없음'} */}
            <div className="basket-selection">
                <input type="checkbox" id="select-all" checked={selectAll} onChange={handleSelectAll} />
                <label htmlFor="select-all">전체 선택</label>
            </div>
            
            {items.map((item) => (
                <BasketItem
                    key={item.productId}
                    item={item}
                    onSelect={() => handleSelectItem(item.productId)}
                    onQuantityChange={handleQuantityChange}
                    onDelete={() => handleDeleteItem(item.productId)}
                />
            ))}

            <div className="basket-total">
                <p>총 금액 합계: <strong>{totalPrice.toLocaleString()}원</strong></p>
            </div>

            <div className="basket-actions">
                <button className="delete-all-btn" onClick={handleDeleteSelected}>장바구니 삭제</button>
                <button className="purchase-btn" onClick={handlePayment}>결제하기</button>
            </div>

            {showModal && (
                <Modal message="상품을 선택해주세요." onClose={closeModal} />
            )}

            {showLoginModal && (
                <Modal message="결제는 로그인이 필요합니다." onClose={closeLoginModal} />
            )}
        </div>
    );
};


// BasketItem 컴포넌트
const BasketItem = ({ item, onSelect, onQuantityChange, onDelete }) => (
    <div className="basket-item">
        <div className="basket-item-checkbox">
            <input type="checkbox" checked={item.isSelected} onChange={onSelect} />
        </div>
        <div className="basket-item-info">
            <div className="basket-item-image">
                <img
                    src={item ? `${process.env.REACT_APP_URL}/images/${item.category}/${item.productId}.jpg` : '/path/to/placeholder-image.jpg'}
                    alt={item.name}
                />
            </div>
            <div className="basket-item-details">
                <p className="basket-item-name">{item.productName}</p>
                <p className="basket-item-price">{parseInt(item.price, 10).toLocaleString()}원</p>
            </div>
        </div>
        <div className="basket-item-controls">
            <button className="quantity-btn" onClick={() => onQuantityChange(item.productId, item.quantity - 1)}>-</button>
            <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value))}
                style={{ textAlign: 'center' }}
            />
            <button className="quantity-btn" onClick={() => onQuantityChange(item.productId, item.quantity + 1)}>+</button>
        </div>
        <div className="basket-item-total">
            <p>총 {(item.price * item.quantity).toLocaleString()}원</p>
        </div>
        <button className="delete-btn" onClick={onDelete}>x</button>
    </div>
);

export default Baskets;

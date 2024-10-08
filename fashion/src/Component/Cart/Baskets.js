import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Baskets.css';

const Baskets = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('username');

    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // 관리자인지 여부를 저장할 상태 추가
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const guestLogin = sessionStorage.getItem('guestLogin') === 'true';
        const userLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true';
        const userRole = localStorage.getItem('role'); 
        const storedUserId = sessionStorage.getItem('username'); // sessionStorage에서 가져오기
    
        console.log(storedUserId, userLoggedIn);
        
        if (!storedUserId && userLoggedIn) {
            navigate('/login');
            return;
        }
    
        if (guestLogin || userLoggedIn) {
            setIsGuest(guestLogin);
            setIsLoggedIn(userLoggedIn);
    
            if (userRole === 'ADMIN') {
                setIsAdmin(true);
            }
    
            if (userLoggedIn) {
                fetch(`http://10.125.121.188:8080/api/cart`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('accessToken'),
                    },
                })
                    .then((response) => {
                        console.log('Response:', response);
                        if (!response.ok) {
                            throw new Error('Failed to fetch cart items');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log('Fetched data:', data);
                        setItems(data.items.map((item) => ({ 
                            ...item, 
                            isSelected: false,
                            imageUrl: item.imageUrl, 
                            name: item.productName, 
                            quantity: item.quantity 
                        })));
                    })
                    .catch((error) => console.error('Failed to fetch cart items:', error));
            } else if (guestLogin) {
                const storedItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
                setItems(storedItems.map((item) => ({ ...item, isSelected: false })));
            }
        } else {
            setShowLoginModal(true);
        }
    }, [navigate, userId]);

    const totalPrice = items
        .filter((item) => item.isSelected)
        .reduce((acc, item) => acc + (parseInt(item.price, 10) || 0) * (parseInt(item.quantity, 10) || 1), 0);

    const handlePayment = () => {
        const selectedItems = items.filter((item) => item.isSelected);
        if (selectedItems.length === 0) {
            setShowModal(true);
        } else {
            sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
            navigate('/payment');
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

            const allSelected = updatedItems.every((item) => item.isSelected);
            setSelectAll(allSelected);

            return updatedItems;
        });
    };

    const handleDeleteSelected = () => {
        const remainingItems = items.filter((item) => !item.isSelected);
        setItems(remainingItems);

        if (isLoggedIn) {
            fetch(`http://10.125.121.188:8080/api/cart/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ items: remainingItems }),
            }).catch((error) => console.error('Failed to update cart:', error));
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
            fetch(`http://10.125.121.188:8080/api/cart/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(updatedItems),
            }).catch((error) => console.error('Failed to update cart:', error));
        } else if (isGuest) {
            sessionStorage.setItem('cartItems', JSON.stringify(updatedItems));
        }
    };

    useEffect(() => {
        console.log('Item images:', items.map(item => item.images));
    }, [items]);

    const handleDeleteItem = (id) => {
        const remainingItems = items.filter((item) => item.productId !== id);
        setItems(remainingItems);

        if (isLoggedIn) {
            fetch(`http://10.125.121.188:8080/api/cart/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ items: remainingItems }),
            }).catch((error) => console.error('Failed to update cart:', error));
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

            <div className="basket-selection">
                <input type="checkbox" id="select-all" checked={selectAll} onChange={handleSelectAll} />
                <label htmlFor="select-all">전체 선택</label>
            </div>

            {items.map((item) => (
    <div key={item.productId} className="basket-item">
        <div className="basket-item-checkbox">
            <input type="checkbox" checked={item.isSelected} onChange={() => handleSelectItem(item.productId)} />
        </div>

        <div className="basket-item-info">
            <div className="basket-item-image">
            <img
            src={item.pimgPath ? `http://10.125.121.188:8080${item.pimgPath}` : '/path/to/placeholder-image.jpg'}
            alt={item.productName}
            className="basket-item-image"
        />
            </div>
            <div className="basket-item-details">
                <p className="basket-item-name">{item.productName}</p>
                <p className="basket-item-price">{parseInt(item.price, 10).toLocaleString()}원</p>
            </div>
        </div>

        <div className="basket-item-controls">
            <button className="quantity-btn" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>-</button>
            <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                style={{ textAlign: 'center' }}
            />
            <button className="quantity-btn" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>+</button>
        </div>

        <div className="basket-item-total">
            <p>총 {(item.price * item.quantity).toLocaleString()}원</p>
        </div>
        <button className="delete-btn" onClick={() => handleDeleteItem(item.productId)}>x</button>
    </div>
))}

            <div className="basket-total">
                <p>총 금액 합계: <strong>{totalPrice.toLocaleString()}원</strong></p>
            </div>

            <div className="basket-actions">
                <button className="delete-all-btn" onClick={handleDeleteSelected}>장바구니 삭제</button>
                <button className="purchase-btn" onClick={handlePayment}>결제하기</button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">상품을 선택해주세요.</p>
                        <button onClick={closeModal}>확인</button>
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

export default Baskets;
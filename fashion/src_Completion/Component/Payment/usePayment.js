import { useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4';

const usePayment = () => {
    const navigate = useNavigate();
    const calculateTotalPrice = (orderItems) => {
        return orderItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    };

    const handlePayment = async (completedOrder) => {
        ReactGA.event('add_payment_info')
        const gaItems = completedOrder.orderItems.map(item => {
            // pimgPath에서 카테고리 추출 (예: '/images/청바지/4114.jpg' -> '청바지')
            const itemCategory = item.pimgPath.split('/')[2];
            return {
                item_name: item.productName,  // 제품 이름
                item_id: item.productId,      // 제품 ID
                price: item.price,            // 제품 가격
                quantity: item.quantity,      // 수량
                item_category: itemCategory,  // 추출된 카테고리
                item_variant: item.size || "One Size" // 제품 사이즈 또는 기본값 설정
            };
        });

        const totalPrice = calculateTotalPrice(completedOrder.orderItems);
        console.log(completedOrder)
        const totalName = completedOrder.orderItems.length > 1
            ? `${completedOrder.orderItems[0].productName} 외 ${completedOrder.orderItems.length - 1}건`
            : completedOrder.orderItems[0].productName;
        console.log(completedOrder)
        console.log(totalName)
        window.IMP.init(process.env.REACT_APP_KG_ID); // Iamport 고유 식별자 초기화
        window.IMP.request_pay({
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: completedOrder.merchantUid,
            goodsname: totalName,
            name : totalName,
            amount: 100,
            // amount: totalPrice, // 고정값으로 설정된 결제 금액, 실제로는 totalPrice가 들어가야 함.
            buyer_name: completedOrder.recipientName,
            buyer_tel: completedOrder.recipientPhone,
            buyer_addr: completedOrder.recipientAddress,
            buyer_postcode: completedOrder.postCode
        }, (rsp) => {
            if (rsp.success) {
                fetch(`${process.env.REACT_APP_API_URL}/orders/done/${rsp.imp_uid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('accessToken'),
                    },
                    body: JSON.stringify({
                        merchantUid: completedOrder.merchantUid,
                        userId: localStorage.getItem('userId'),
                        paymentMethod: rsp.pay_method,
                        orderItems: completedOrder.orderItems,
                        paymentStatus: rsp.status,
                        payValue: rsp.paid_amount,
                        postcode: rsp.buyer_postcode
                    }),
                })
                    .then((response) => {
                        console.log('Payment successful:', response);
                        ReactGA.event("purchase", {
                            transaction_id: sessionStorage.getItem('transactionId'),  // 거래 ID
                            affiliation: "TrendFlow", // 매장 이름
                            value: totalPrice,  // 총 금액
                            currency: "KRW", // 통화
                            shipping: 0.0,  // 배송료 (필요 시 데이터 추가)
                            items: gaItems  // 변환된 items 배열
                        });
                        navigate('/paycompleted');
                    })
                    .catch((error) => {
                        console.error('Payment error:', error);
                    });
            } else {
                console.error('Payment failed:', rsp.error_msg);
            }
        });
    };

    return { handlePayment };
};

export default usePayment;

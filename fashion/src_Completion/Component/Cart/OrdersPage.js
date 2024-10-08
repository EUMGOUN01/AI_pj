import React, { useState } from 'react';
import axios from 'axios';

function OrdersPage() {
    const [cartIds, setCartIds] = useState('');
    const [postCode, setPostCode] = useState('');
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [ordererName, setOrdererName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [payMethod, setPayMethod] = useState('CARD');

    const axiosInstance = axios.create({ withCredentials: true }); // 세션값을 저장하고 사용하기 위해 호출

    // 장바구니 -> 주문하기 api 호출 : 세션에 주문정보 저장하는 함수 필요

    // 결제하기 누르면 사용자 입력 + 세션 저장값 -> 주문 테이블 -> 결제 함수 호출
    async function completeOrder() { 
        try { // 세션값 사용해야 하므로 axiosInstance 사용
            const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/v1/order/done`, {
                postCode, 
                address,
                detailAddress,
                ordererName,
                phoneNumber,
                payMethod // CARD, TRANS, VBANK, PHONE 중 하나로
            });
            console.log(response.data);
            handlePayment(response.data);  // 결제 함수 호출 - 리턴값을 파라미터로
            
        } catch (error) {
            console.error('Error completing order:', error);
        }
    }
}
// 프론트에서 결제 진행 -> 완료되면 그때 백엔드 전달(결제 api 호출)
async function handlePayment(orderInfo) { 
    // index.html에 iamport CDN 불러와야 사용할 수 있음
    window.IMP.init('imp04081725'); // 이 값은 계정 고유번호이므로 고정
    window.IMP.request_pay({
        pg: "html5_inicis", // 고정
        pay_method : orderInfo.payMethod,    
        merchant_uid : orderInfo.merchantUid,   
        name : orderInfo.productName, 
        amount: orderInfo.totalPrice, 
        buyer_name : orderInfo.ordererName,  
        buyer_tel : orderInfo.phoneNumber,    
        buyer_postcode : orderInfo.postCode, 
        buyer_addr : orderInfo.address
    }, (rsp) => {
        if (rsp.success) { // 프론트에서 결제가 완료되면
            axios.post(`${process.env.REACT_APP_API_URL}/v1/order/payment/${rsp.imp_uid}`, { 
                memberId: orderInfo.memberId ,
                orderId:orderInfo.orderId,
                price : orderInfo.totalPrice,
                inventoryIdList : orderInfo.productMgtIds
            }) // 백엔드 결제 api 호출 orderInfo.member.id
                .then((res) => {
                    // 결제완료 
                })
                .catch((error) => {
                    // 에러발생시
                });
        } else {
            // 에러발생시
        }
    });
}
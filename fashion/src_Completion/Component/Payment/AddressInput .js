import React from 'react';

const AddressInput = ({ address, postcode, detailedAddress, onSearchClick, setDetailedAddress }) => {
    return (
        <div className="payment-delivery-info">

            <h3>주소</h3>
            <div className="address-container">
                <div className="address-row">
                    <input
                        type="text"
                        className="payment-input-fields"
                        placeholder="우편번호"
                        value={postcode}
                        readOnly // 우편번호는 주소 검색으로만 입력되도록 설정
                    />
                    <button type="button" className="search-address-btn" onClick={onSearchClick}>
                        주소 찾기
                    </button>
                </div>

                <input
                    type="text"
                    className="payment-input-fields"
                    placeholder="도로명 주소"
                    value={address}
                    readOnly // 도로명 주소도 검색을 통해서만 입력되도록 설정
                />

                <input
                    type="text"
                    className="payment-input-fields"
                    placeholder="상세주소"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)} // 상세 주소 입력값 저장
                />
            </div>
        </div>
    );
};

export default AddressInput;

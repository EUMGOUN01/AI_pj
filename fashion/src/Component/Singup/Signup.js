import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 상태 관리
    const [formData, setFormData] = useState({
        name: '',        // 이름
        username: '',    // 사용자 아이디
        password: '',    // 비밀번호
        email: '',       // 이메일
        residentRegistrationNumber: '',   // 주민등록번호
        address: '',     // 주소
        phone: '',       // 전화번호
        style: '',       // 선호하는 스타일
    });
    const [maskedBack, setMaskedBack] = useState(''); // 마스킹된 뒷자리 값
    const [realBack, setRealBack] = useState(''); // 실제 뒷자리 값
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 관리

    // 입력 값 상태 변경
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // 주민등록번호를 두 개의 입력 필드로 나누어 처리
    const handleIdChange = (e, part) => {
        const value = e.target.value;

        if (part === 'front') {
            setFormData({
                ...formData,
                residentRegistrationNumber: value + formData.residentRegistrationNumber.slice(6)  // 앞 6자리 업데이트
            });
        } else if (part === 'back') {
            setRealBack(value);  // 뒷자리 실제 값 저장
            const maskedValue = value[0] + '*'.repeat(Math.max(0, value.length - 1)); // 첫 글자만 보이고 나머지는 '*'
            setMaskedBack(maskedValue); // 마스킹된 값을 업데이트

            setFormData({
                ...formData,
                residentRegistrationNumber: formData.residentRegistrationNumber.slice(0, 6) + value  // 전체 주민등록번호 업데이트
            });
        }
    };

    // 백엔드 회원가입 API 호출
    const handleSignup = async () => {
        try {
             // 백엔드로 보낼 데이터 생성, 주민등록번호 앞 6자리 + 뒷자리 첫 숫자
             const signupData = {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                email: formData.email,
                residentRegistrationNumber: formData.residentRegistrationNumber.slice(0, 6) + formData.residentRegistrationNumber[6], // 앞 6자리 + 뒷자리 첫 숫자
                address: formData.address,
                address: formData.address,
                phone: formData.phone,
                style: formData.style
            };

            console.log("회원가입 데이터:", signupData); // 콘솔에 데이터 출력

            const response = await fetch('http://10.125.121.188:8080/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),  // 사용자가 입력한 데이터를 그대로 JSON으로 변환하여 백엔드로 전송
            });

            if (response.ok) {
                // 회원가입 성공 시 모달 창 열기
                setIsModalOpen(true);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            setErrorMessage('회원 정보를 다시 입력해주세요.');
        }
    };

    const handleDuplicateCheck = async (field, value) => {
        // 중복 확인 로직 처리
        try {
            const response = await fetch(`http://10.125.121.188:8080/api/auth/check-duplicate?field=${field}&value=${value}`);
            if (response.ok) {
                alert(`${field === 'username' ? '아이디' : '이메일'} 중복 확인 완료`);
            } else {
                alert(`${field === 'username' ? '아이디' : '이메일'}가 이미 사용 중입니다.`);
            }
        } catch (error) {
            alert('중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate('/login'); // 로그인 화면으로 이동
    };

    return (
        <div className="signup-container">
            <div className="signup-header">
                <h2 className="signup-title">회원가입</h2>
                <p className="signup-description">모든 입력은 필수 사항 입니다.</p>
                <p className="signup-note">* 현재 입력된 사용자의 정보는 어떠한 상업적 이용이 없음을 알려드립니다.</p>
            </div>

            <div className="signup-form-container">
                {/* 이름 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="name" className="form-label">이름</label>
                    <input
                        id="name"
                        className="form-input"
                        type="text"
                        placeholder="이름을 입력해주세요."
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                {/* 아이디 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="username" className="form-label">아이디</label>
                    <input
                        id="username"
                        className="form-input short-input"
                        type="text"
                        placeholder="아이디 입력(영문 5-20자 이상)"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <button 
                        className="inline-button" 
                        onClick={() => handleDuplicateCheck('username', formData.username)}>
                        중복 확인
                    </button>
                </div>

                {/* 비밀번호 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="password" className="form-label">비밀번호</label>
                    <input
                        id="password"
                        className="form-input"
                        type="password"
                        placeholder="비밀번호를 입력해주세요.(대소문자, 숫자 포함 8자 이상)"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                {/* 이메일 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="email" className="form-label">이메일</label>
                    <input
                        id="email"
                        className="form-input short-input"
                        type="email"
                        placeholder="이메일을 입력해주세요."
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <button 
                        className="inline-button" 
                        onClick={() => handleDuplicateCheck('email', formData.email)}>
                        중복 확인
                    </button>
                </div>

                {/* 전화번호 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="phone" className="form-label">전화번호</label>
                    <input
                        id="phone"
                        className="form-input"
                        type="text"
                        placeholder="전화번호를 입력해주세요.(ex.01011112222)"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                {/* 주소 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="address" className="form-label">주소</label>
                    <input
                        id="address"
                        className="form-input"
                        type="text"
                        placeholder="주소를 입력해주세요."
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

                {/* 주민등록번호 입력 필드 */}
                <div className="form-group">
                    <label htmlFor="residentRegistrationNumber" className="form-label">주민등록번호</label>
                    <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            id="birthYear"
                            className="form-input"
                            type="text"
                            placeholder="앞 6자리(ex. 900101)"
                            value={formData.residentRegistrationNumber.slice(0, 6)}
                            onChange={(e) => handleIdChange(e, 'front')}
                            style={{ flex: 1 }}
                            maxLength="6"
                        />
                        <input
                            id="birthMonthDay"
                            className="form-input"
                            type="text"  
                            placeholder="뒤 7자리"
                            value={maskedBack}
                            onChange={(e) => handleIdChange(e, 'back')}
                            style={{ flex: 1 }}
                            maxLength="7"
                        />
                    </div>
                </div>

                {/* 스타일 선택 필드 */}
                <div className="form-group">
                    <label htmlFor="style" className="form-label">선호하는 스타일</label>
                    <select
                        id="style"
                        className="form-select"
                        value={formData.style}
                        onChange={handleChange}
                    >
                        <option value="">선호하는 스타일 선택해주세요.</option>
                        <option value="CASUAL">캐주얼</option>      {/* CASUAL, 캐주얼 */}
                        <option value="FORMAL">포멀</option>        {/* FORMAL, 포멀 */}
                        <option value="SPORTY">스포티</option>      {/* SPORTY, 스포티 */}
                        <option value="VINTAGE">빈티지</option>     {/* VINTAGE, 빈티지 */}
                        <option value="BOHEMIAN">보헤미안</option>  {/* BOHEMIAN, 보헤미안 */}
                        <option value="MINIMALIST">미니멀리즘</option> {/* MINIMALIST, 미니멀리즘 */}
                        <option value="STREETWEAR">스트릿웨어</option> {/* STREETWEAR, 스트릿웨어 */}
                    </select>
                </div>
            </div>

            {/* 에러 메시지 */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {/* 가입하기 버튼 */}
            <div className="submit-button-container">
                <button className="submit-button" onClick={handleSignup}>가입하기</button>
            </div>

            {/* 모달 창 */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>이메일 인증을 보냈습니다.</h3>
                        <p>인증 후 로그인을 이용 해주세요.</p>
                        <button className="si-close-button" onClick={handleCloseModal}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup; 
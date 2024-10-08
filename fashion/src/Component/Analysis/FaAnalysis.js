import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCircleXmark, faRotateRight, faCircleInfo, faFaceSmile, faFaceMeh, faFaceFrown } from '@fortawesome/free-solid-svg-icons'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import '../../CSS/FaAnalysis.css';

const styleOptions = [
    { value: '클래식', label: '클래식' },
    { value: '매니시', label: '매니시' },
    { value: '페미니', label: '페미니' },
    { value: '에스닉', label: '에스닉' },
    { value: '컨템포러리', label: '컨템포러리' },
    { value: '내추럴', label: '내추럴' },
    { value: '젠더리스', label: '젠더리스' },
    { value: '스포티', label: '스포티' },
    { value: '서브컬처', label: '서브컬처' },
    { value: '캐주얼', label: '캐주얼' },
];

const FaAnalysis = () => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // 페이지 이동 함수
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [topStyles, setTopStyles] = useState([]); 
    const [recommendedProducts, setRecommendedProducts] = useState([]); 
    const [captionResult, setCaptionResult] = useState(''); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false); 
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackOption, setFeedbackOption] = useState(null);
    const [selectedStyles, setSelectedStyles] = useState([]);
    const [showRecommendedProducts, setShowRecommendedProducts] = useState(false);

    const handleClick = () => {
        fileInputRef.current.click();
    };

     // 유사 상품 클릭 이벤트 핸들러
     const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // 상품 상세 페이지로 이동
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setPreviewUrl(null);
        }
    };

    const handleAnalyzeClick = async () => {
        if (!imageFile) {
            alert('이미지를 업로드 해주세요.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', imageFile, imageFile.name);

            const response = await fetch('http://10.125.121.188:8080/api/recommendation/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log("API 응답 데이터:", data);

            const { styleindex, recommendedProducts, captionResult } = data;

            if (Array.isArray(styleindex)) {
                setTopStyles(styleindex.map(style => style.nameKo));
            } else {
                console.error('스타일 데이터가 유효하지 않습니다:', styleindex);
                alert('스타일 데이터를 받지 못했습니다.');
            }

            if (Array.isArray(recommendedProducts)) {
                const updatedProducts = recommendedProducts.map(product => ({
                    ...product,
                    imagePath: `http://10.125.121.188:8080${product.imagePath}`
                }));
                setRecommendedProducts(updatedProducts);
            } else {
                console.error('추천 상품 데이터가 유효하지 않습니다:', recommendedProducts);
                alert('추천 상품 데이터를 받지 못했습니다.');
            }

            if (captionResult) {
                setCaptionResult(captionResult);
            } else {
                console.error('설명 결과가 유효하지 않습니다:', captionResult);
                alert('설명 결과를 받지 못했습니다.');
            }

             // 분석 완료 후 10초 지연
            setTimeout(() => {
                setIsSurveyModalOpen(true);
            }, 10000); // 10초 후에 만족도 조사 모달 표시


        } catch (error) {
            console.error('분석 중 오류 발생:', error);
            alert('분석 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setIsSurveyModalOpen(true);
            }, 10000);

            return () => clearTimeout(timer); 
        }
    }, [loading]);

    useEffect(() => {
        if (isModalOpen) {
            document.querySelector('.fa-analysis-modal-content-right').classList.add('show');
        }
        if (isSurveyModalOpen) {
            document.querySelector('.fa-analysis-survey-modal-content-right').classList.add('show');
        }
        if (isFeedbackModalOpen) {
            document.querySelector('.fa-analysis-feedback-modal-content-right').classList.add('show');
        }
    }, [isModalOpen, isSurveyModalOpen, isFeedbackModalOpen]);

    const handleReload = () => {
        window.location.reload();
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const toggleSurveyModal = () => {
        setIsSurveyModalOpen(!isSurveyModalOpen);
    };

    const handleFeedbackClick = (feedback) => {
        setFeedbackOption(feedback);
        if (feedback === '불만족') {
            setIsSurveyModalOpen(false);
            setIsFeedbackModalOpen(true);
        }
    };

    const handleStyleChange = (selectedOptions) => {
        setSelectedStyles(selectedOptions);
    };

    return (
        <div className="fa-analysis-unique-container">
            <div className="fa-analysis-unique-header">
                <h1>패션 분석</h1>
                <p>정보를 알고 싶은 옷의 이미지를 이곳에 넣어 옷에 대한 정보를 확인해보세요.</p>
                <div className="fa-analysis-unique-divider"></div>
            </div>
    
            <div className="fa-analysis-unique-content" style={{ display: 'flex' }}>
                    {/* 옷 업로드 부분 */}
                    <div className="fa-analysis-unique-upload-section" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2>옷 업로드</h2>
                            <FontAwesomeIcon 
                                icon={faCircleInfo} 
                                onClick={toggleModal} 
                                style={{ cursor: 'pointer', fontSize: '18px', color: 'gray', marginLeft: '10px', marginTop: '10px' }} 
                            />
                        </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>* 명확한 사진을 업로드 해주세요.</p>
                        <FontAwesomeIcon 
                            icon={faRotateRight} 
                            onClick={handleReload} 
                            style={{ cursor: 'pointer', fontSize: '18px', color: 'gray' }} 
                        />
                    </div>
                    <div className="fa-analysis-unique-upload-box" onClick={handleClick} style={{ position: 'relative' }}>
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : previewUrl ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain'
                                    }} 
                                />
                                <FontAwesomeIcon 
                                    icon={faCircleXmark} 
                                    onClick={() => setImageFile(null)} 
                                    style={{ 
                                        position: 'absolute', 
                                        top: '10px', 
                                        right: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '24px'
                                    }} 
                                />
                            </div>
                        ) : (
                            <p>클릭하여 이미지를 업로드</p>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleImageChange}
                        />
                    </div>
                    <button 
                        className="fa-analysis-unique-analyze-button" 
                        onClick={handleAnalyzeClick}
                        disabled={loading}
                    >
                        {loading ? "분석 중..." : "분석하기"}
                    </button>
                </div>

                {/* 상위 스타일 설명 부분 */}
                    {topStyles.length > 0 && (
                        <div className="fa-analysis-results" style={{ flex: 1, marginLeft: '20px' }}>
                            {/* 분석 설명을 상위 스타일보다 위에 배치 */}
                            {captionResult && (
                                <div className="fa-analysis-caption" style={{ marginBottom: '10px', marginTop: '100px' }}> {/* 간격 조정 */}
                                    <h2>분석 설명</h2>
                                    <p>{captionResult}</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <h2 style={{ marginTop: '30px', textAlign: 'center' }}>스타일</h2>
                                <ul style={{ 
                                    listStyle: 'none', 
                                    padding: 0, 
                                    fontSize: '30px', 
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    justifyContent: 'center', 
                                    gap: '20px'  // 각 항목 사이의 간격
                                }}>
                                    {topStyles.map((style, index) => (
                                        <li key={index} style={{ margin: '10px' }}>{`#${style}`}</li>  // '#' 추가
                                    ))}
                                </ul>
                            </div>
                       

                            {/* 관련 스타일 더보기 링크 추가 */}
                            <div style={{ textAlign: 'right', marginTop: '50px' }}>
                                <span 
                                    onClick={() => setShowRecommendedProducts(!showRecommendedProducts)} 
                                    style={{ 
                                        backgroundColor: 'transparent', 
                                        border: 'none', 
                                        color: 'black',  /* 검정색으로 변경 */
                                        cursor: 'pointer', 
                                        padding: '0', 
                                        fontSize: '20px',
                                        fontWeight: 'bold', /* 버튼 텍스트 강조 */
                                        outline: 'none' 
                                    }}
                                >
                                    관련 스타일 더보기 &gt;
                                </span>
                            </div>
                        </div>
                    )}
            </div>

          {/* 유사 상품 표시 부분 */}
          {showRecommendedProducts && recommendedProducts.length > 0 && (
                <div className="fa-analysis-recommendations" style={{ marginTop: '20px' }}>
                    <h2>유사 상품</h2>
                    <div className="fa-recommended-products-grid-horizontal">
                        {recommendedProducts.slice(0, 5).map((product) => (
                            <div key={product.productId} className="product-card-horizontal" onClick={() => handleProductClick(product.productId)}>
                                <img 
                                    src={product.imagePath} 
                                    alt={product.name} 
                                    style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                                />
                                <h3>{product.name}</h3>
                                <p>{product.info}</p>
                                <p>{product.price}원</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 모달 부분 */}
            {isModalOpen && (
                <div className="fa-analysis-modal-content-right">
                    <h2>주의 사항</h2>
                    <p>사물(옷)하나만 있을 경우, 옷과 관련이 없는 사물의 경우 올바른 결과가 나오지 않습니다.</p>
                    <button onClick={toggleModal}>닫기</button>
                </div>
            )}
    
            {isSurveyModalOpen && (
                <div className="fa-analysis-survey-modal-content-right">
                    <button className="close-button" onClick={toggleSurveyModal}>x</button>
                    <h2>만족도 조사</h2>
                    <p>분석 결과에 만족하셨나요?</p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                        <FontAwesomeIcon icon={faFaceSmile} size="2x" color="black" onClick={() => handleFeedbackClick('만족')} style={{ cursor: 'pointer' }} />
                        <FontAwesomeIcon icon={faFaceMeh} size="2x" color="black" onClick={() => handleFeedbackClick('보통')} style={{ cursor: 'pointer' }} />
                        <FontAwesomeIcon icon={faFaceFrown} size="2x" color="black" onClick={() => handleFeedbackClick('불만족')} style={{ cursor: 'pointer' }} />
                    </div>
                    <button onClick={toggleSurveyModal} style={{ marginTop: '20px' }}>닫기</button>
                </div>
            )}
    
            {isFeedbackModalOpen && (
                <div className="fa-analysis-feedback-modal-content-right">
                    <button className="close-button" onClick={() => setIsFeedbackModalOpen(false)}>x</button>
                    <h2>스타일 선택</h2>
                    <p>이 이미지에 적합한 스타일을 선택해주세요 (최대 2개):</p>
                    <Select
                        isMulti
                        value={selectedStyles}
                        onChange={handleStyleChange}
                        options={styleOptions}
                        maxMenuHeight={150}
                        placeholder="스타일 선택"
                        menuPlacement="top"
                    />
                    <button onClick={() => setIsFeedbackModalOpen(false)} style={{ marginTop: '20px' }}>제출</button>
                </div>
            )}
        </div>
    );
};

export default FaAnalysis;
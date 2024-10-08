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

    const handleClick = () => {
        fileInputRef.current.click();
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

            const response = await fetch(`${process.env.REACT_APP_API_URL}/recommendation/analyze`, {
                headers : {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
                },
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log(data)
            const { recommendedProducts, styleindex, captionResult } = data;
            console.log("recom : ", recommendedProducts)
            console.log("styleindex : ", styleindex)
            console.log("captionResult : ", captionResult)
            if (Array.isArray(styleindex)) {
                setTopStyles(styleindex.map(style => style.nameKo));
            } else {
                console.error('스타일 데이터가 유효하지 않습니다:', styleindex);
                alert('스타일 데이터를 받지 못했습니다.');
            }

            if (Array.isArray(recommendedProducts)) {
                const updatedProducts = recommendedProducts.map(product => ({
                    ...product,
                    imagePath: product.imagePath.replace("C:\\workspace_pj2\\back\\images\\", "http://localhost:8080/images/") 
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
            }, 10000); // 10초 후에 모달창 나타나게 설정

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
            setIsFeedbackModalOpen(true); // 불만족일 경우 스타일 선택 창으로 이동
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

            <div className="fa-analysis-unique-content">
                <div className="fa-analysis-unique-upload-section">
                    <h2>옷 업로드</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>* 명확한 사진을 업로드 해주세요.</p>
                        <FontAwesomeIcon 
                            icon={faCircleInfo} 
                            onClick={toggleModal} 
                            style={{ cursor: 'pointer', fontSize: '18px', color: 'gray', marginRight: '400px' }} 
                        />
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
            </div>

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
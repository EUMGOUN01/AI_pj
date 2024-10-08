import React, { useState, useEffect, forwardRef } from 'react';
import Admheader from '../Admins/Admheader';
import '../../CSS/Storemanage.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 커스텀 입력 컴포넌트
const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    className="custom-date-input"
    onClick={onClick}
    ref={ref}
    value={value}
    readOnly
  />
));

const Storemanage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedStore, setSelectedStore] = useState('');
  const [chartDataList, setChartDataList] = useState([]);
  const [viewMode, setViewMode] = useState('day');
  const [isSalesViewed, setIsSalesViewed] = useState(false);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedItem, setSelectedItem] = useState(null); // 클릭된 아이템 저장
  const [activeItem, setActiveItem] = useState(null); // 활성화된 아이템 저장
  const [relatedItems, setRelatedItems] = useState([]); // 관련 아이템 저장

  // 체크박스 상태 관리
  const [isYearChecked, setIsYearChecked] = useState(false);
  const [isMonthChecked, setIsMonthChecked] = useState(false);
  const [isDateChecked, setIsDateChecked] = useState(false);
  const [productDisplay, setProductDisplay] = useState([]);

  const storeData = [
    { id: 1, name: '부산구서점(직)', dailySales: [200, 150, 300, 250, 180, 300, 280], monthlySales: [1000, 1200, 1300] },
    { id: 2, name: '부산두실점(직)', dailySales: [180, 220, 250, 300, 200, 270, 290], monthlySales: [1100, 1150, 1400] },
    { id: 3, name: '부산만덕점(직)', dailySales: [170, 190, 210, 260, 240, 250, 300], monthlySales: [1050, 1250, 1350] },
    { id: 4, name: '부산모라점(직)', dailySales: [160, 180, 240, 230, 250, 280, 320], monthlySales: [1080, 1180, 1280] },
    { id: 5, name: '부산연지점(직)', dailySales: [190, 210, 230, 270, 250, 300, 350], monthlySales: [1090, 1190, 1390] },
    { id: 6, name: '부산하단점', dailySales: [200, 230, 260, 290, 300, 320, 340], monthlySales: [1120, 1220, 1320] },
  ];

  // selectedYear가 변경될 때 startDate와 endDate 업데이트
  useEffect(() => {
    if (isYearChecked) {
      setStartDate(new Date(`${selectedYear}-${startMonth}-01`));
      setEndDate(new Date(`${selectedYear}-${endMonth}-01`));
    }
  }, [selectedYear, startMonth, endMonth, isYearChecked]);

  const handleSalesSearch = () => {
    let filteredData = storeData;

    // 매장 선택 필터링
    if (selectedStore !== '') {
      filteredData = storeData.filter(store => store.name === selectedStore);
    }

    let start = new Date();
    let end = new Date();

    // 년도별 조회
    if (isYearChecked) {
      start = new Date(`${selectedYear}-01-01`); // 선택한 년도의 1월 1일
      end = new Date(`${selectedYear}-12-31`); // 선택한 년도의 12월 31일
    }

    // 월별 조회
    if (isMonthChecked) {
      start = new Date(`${selectedYear}-${startMonth}-01`); // 선택한 월의 1일
      end = new Date(`${selectedYear}-${endMonth}-01`);
      end.setMonth(end.getMonth() + 1); // 마지막 달의 다음 달 1일
      end.setDate(0); // 마지막 달의 마지막 날로 설정
    }

    // 특정기간 조회
    if (isDateChecked) {
      start = startDate; // 선택한 시작일
      end = endDate; // 선택한 종료일
    }

    const timeDiff = end - start;
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff < 1 && viewMode === 'day') {
      alert("조회 기간은 최소 1일 이상이어야 합니다.");
      return;
    }

    // 데이터셋 생성
    const datasetsList = filteredData.map(store => {
      let labels = [];
      let data = [];
      let borderColor = '';

      if (viewMode === 'day') {
        borderColor = 'rgba(75,192,192,1)'; // 일별 차트 색상
        let currentDate = new Date(start);
        while (currentDate <= end) {
          const salesDataIndex = Math.floor((currentDate - start) / (1000 * 3600 * 24));
          if (store.dailySales[salesDataIndex] !== undefined) {
            labels.push(`${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`);
            data.push(store.dailySales[salesDataIndex] || 0);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        borderColor = 'rgba(255,99,132,1)'; // 월별 차트 색상
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

        for (let i = startMonth - 1; i < endMonth; i++) {
          labels.push(months[i]);
          data.push(store.monthlySales[i - (startMonth - 1)] || 0);
        }
      }

      return {
        labels: labels,
        datasets: [
          {
            label: store.name,
            data: data,
            fill: false,
            borderColor: borderColor, // 설정된 색상 적용
            tension: 0.1,
          },
        ],
      };
    });

    setChartDataList(datasetsList);
    setIsSalesViewed(true); // 매출 조회 후 상태 변경
  };

  const handleProductSearch = () => {
    let filteredData = storeData;

    if (selectedStore !== '') {
      filteredData = storeData.filter(store => store.name === selectedStore);
    }

    // 상품 정보가 없더라도 기본 도형을 표시하도록 설정
    const productList = filteredData.length > 0
      ? filteredData.map(store => (
        <div key={store.id}>
          <h2 className="store-name">{store.name} TOP5</h2>
          <div className="product-list">
            {/* items가 있으면 해당 아이템들 표시, 없으면 기본 도형과 텍스트 표시 */}
            {store.items && store.items.length > 0 ? (
              store.items.map((item, index) => (
                <div
                  key={index}
                  className={`product-item ${activeItem === index ? 'active' : ''}`}
                  onClick={() => handleItemClick(index)}
                >
                  <div className="product-image-placeholder">상위 아이템 이미지</div>
                  <p className="product-name">{item.name}</p>
                </div>
              ))
            ) : (
              // 기본적으로 5개의 빈 도형을 표시
              Array(5).fill().map((_, index) => (
                <div
                  key={index}
                  className={`product-item ${activeItem === index ? 'active' : ''}`}
                  onClick={() => handleItemClick(index)}
                >
                  <div className="product-image-placeholder">상위 아이템 이미지</div>
                  <p className="product-name">상위 아이템 이름</p>
                </div>
              ))
            )}
          </div>
        </div>
      ))
      : <p>선택한 매장에 상품 정보가 없습니다.</p>;

    setProductDisplay(productList);
  };

  // 아이템 클릭 핸들러
  const handleItemClick = (index) => {
    // 클릭한 아이템이 현재 활성화된 아이템이면 해제
    if (activeItem === index) {
      setActiveItem(null);
      setRelatedItems([]);
    } else {
      // 새로운 아이템 클릭 시 관련 아이템 표시
      setActiveItem(index);
      const relatedItemsList = Array(5).fill().map((_, i) => (
        <div key={i} className="product-item">
          <div className="product-image-placeholder">관련 아이템 이미지</div>
          <p className="product-name">관련 아이템 이름</p>
        </div>
      ));
      setRelatedItems(relatedItemsList);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    handleSalesSearch();
  };

  return (
    <div>
      <Admheader />
      <div className="storemanage-container">
        <h1 className="storemanage-title">매장관리</h1>
        <p className="storemanage-welcome-text">이 페이지는 관리자만 이용 가능합니다.</p>

        <div>
          <p className="storemanage-search-title">매장 조회</p>
          <div className="storemanage-search-section">
            <select className="storemanage-dropdown wide" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
              <option value="">매장 전체 보기</option>
              {storeData.map(store => (
                <option key={store.id} value={store.name}>{store.name}</option>
              ))}
            </select>

            {/* 년도 체크박스 및 드롭다운 */}
            <label>
              <input
                type="checkbox"
                className="circle-checkbox"
                checked={isYearChecked}
                onChange={() => setIsYearChecked(!isYearChecked)}
              />
              년도
            </label>
            <select
              className="storemanage-dropdown"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={!isYearChecked}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 2024} value={i + 2024}>{i + 2024}년</option>
              ))}
            </select>

            {/* 월 체크박스 및 드롭다운 */}
            <label>
              <input
                type="checkbox"
                className="circle-checkbox"
                checked={isMonthChecked}
                onChange={() => setIsMonthChecked(!isMonthChecked)}
              />
              월
            </label>
            <select
              className="storemanage-dropdown month-input"
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              disabled={!isMonthChecked}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}월</option>
              ))}
            </select>
            <span> ~ </span>
            <select
              className="storemanage-dropdown month-input"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
              disabled={!isMonthChecked}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}월</option>
              ))}
            </select>

            {/* 날짜 체크박스 및 DatePicker */}
            <label>
              <input
                type="checkbox"
                className="circle-checkbox"
                checked={isDateChecked}
                onChange={() => setIsDateChecked(!isDateChecked)}
              />
              특정기간
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="storemanage-date-input"
              placeholderText="시작 날짜"
              customInput={<CustomInput />}
              disabled={!isDateChecked}
            />
            <span> ~ </span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="storemanage-date-input"
              placeholderText="종료 날짜"
              customInput={<CustomInput />}
              disabled={!isDateChecked}
            />

            {isSalesViewed && (
              <>
                <button
                  className={`storemanage-search-buttons ${viewMode === 'day' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('day')}
                >
                  일별 조회
                </button>
                <button
                  className={`storemanage-search-button ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('month')}
                >
                  월별 조회
                </button>
              </>
            )}
            <button className="storemanage-search-button" style={{ marginLeft: '10px' }} onClick={handleSalesSearch}>매출 조회</button>
            
            {/* 매출 조회 후에는 상품 조회 버튼 숨기기 */}
            {!isSalesViewed && (
              <button className="storemanage-search-button" onClick={handleProductSearch}>상품 조회</button>
            )}
            
            <button className="storemanage-search-button" onClick={handleReset}>다시 조회</button>
          </div>
        </div>

        {chartDataList.length > 0 && (
          <div className={`storemanage-sales-charts ${chartDataList.length === 1 ? 'storemanage-single-chart' : ''}`}>
            {chartDataList.map((chartData, index) => (
              <div className="storemanage-sales-chart" key={index}>
                <Line
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        cornerRadius: 0, // 모서리를 둥글게 하지 않음
                        callbacks: {
                          title: (tooltipItems) => {
                            return tooltipItems[0].label;
                          },
                          label: (tooltipItem) => {
                            return `매출: ${tooltipItem.raw}원`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="product-display-section">
          {productDisplay}
        </div>

        {/* 클릭된 아이템의 관련 아이템 표시 */}
        {activeItem !== null && (
          <div>
            <h2 className="related-item-title">추천 아이템</h2>
            <div className="related-items-list">
              {relatedItems}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Storemanage;
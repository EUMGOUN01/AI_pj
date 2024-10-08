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
  const [startDay, setStartDay] = useState(1); // 시작 일
  const [endDay, setEndDay] = useState(1);     // 종료 일
  const [selectedStore, setSelectedStore] = useState('');
  const [chartDataList, setChartDataList] = useState([]);
  const [storeList, setStoreList] = useState([]); 
  const [viewMode, setViewMode] = useState('day');
  const [isSalesViewed, setIsSalesViewed] = useState(false);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [activeItem, setActiveItem] = useState(null); 
  const [relatedItems, setRelatedItems] = useState([]); 
  const [productDisplay, setProductDisplay] = useState([]);
  const [isYearChecked, setIsYearChecked] = useState(false);
  const [isMonthChecked, setIsMonthChecked] = useState(false);
  const [isDateChecked, setIsDateChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(true);
  const [storeName, setStoreName] = useState('');
  const [selectedStoreName, setSelectedStoreName] = useState('');

  // 날짜 포맷 함수
  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('ko-KR', options).format(date).replace(/\./g, '.'); // 형식 변경
  };

// 매장 목록 가져오기
useEffect(() => {
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 토큰을 Authorization 헤더에 추가
      };
      // 새로운 API 엔드포인트 URL
      let endpoint = `http://10.125.121.188:8080/api/sales/store-sales?fromYear=${startYear}`;

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch store list');
      }

      const salesData = await response.json();
      console.log("Fetched Store Data:", salesData);

      // 매장 목록을 중복 없이 가져오기 위해 Set 사용
      const uniqueStores = [...new Map(salesData.salesData.map(item => [item.storeId, item])).values()];

      setStoreList(uniqueStores); 
    } catch (error) {
      console.error('Error fetching store list:', error);
    }
  };

  fetchStores();
}, [startYear]);


const handleSalesSearch = async () => {
  try {
    // 기본 매출 조회 API URL 설정
    let endpoint = `http://10.125.121.188:8080/api/sales/store-sales`;

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 토큰을 Authorization 헤더에 추가
    };

    // 매장이 선택되지 않은 경우 경고 메시지를 출력하고 함수 종료
    if (!selectedStore) {
      console.warn('매장을 선택해주세요.');
      return;
    }

    // 선택된 매장의 storeId를 URL에 추가
    endpoint += `?storeId=${selectedStore}`;

    // 특정 기간 조회가 선택된 경우
    if (isDateChecked) {
      // 특정기간 조회에 필요한 정보 추가
      const fromYear = startDate.getFullYear();
      const fromMonth = startDate.getMonth() + 1; // 월은 0부터 시작하므로 +1 필요
      const fromDay = startDate.getDate();
      const toYear = endDate.getFullYear();
      const toMonth = endDate.getMonth() + 1;
      const toDay = endDate.getDate();

      // URL에 해당 기간의 연도, 월, 일 정보를 추가
      endpoint += `&fromYear=${fromYear}&fromMonth=${fromMonth}&fromDay=${fromDay}&toYear=${toYear}&toMonth=${toMonth}&toDay=${toDay}`;
    } 
    // 월별 조회가 선택된 경우
    else if (isMonthChecked) {
      const fromMonth = startMonth; // 선택된 시작 월
      const toMonth = endMonth;     // 선택된 종료 월

      // 선택한 연도의 해당 월의 첫날과 마지막 날짜를 계산
      const fromDay = 1;
      const toDay = new Date(startYear, fromMonth, 0).getDate(); // 해당 월의 마지막 날짜

      // URL에 해당 연도, 월, 일 정보를 추가
      endpoint += `&fromYear=${startYear}&toYear=${startYear}&fromMonth=${fromMonth}&toMonth=${fromMonth}&fromDay=${fromDay}&toDay=${toDay}`;
    } 
    // 연도 조회만 선택된 경우
    else {
      endpoint += `&fromYear=${startYear}&toYear=${startYear}`;
    }

    // 최종적으로 만들어진 매출 조회 API URL을 출력
    console.log("매출 조회 API 요청 URL:", endpoint);

    // 매출 데이터를 조회하기 위한 API 요청
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: headers
    });

    // 응답이 성공적이지 않을 경우 에러 메시지 출력 및 예외 발생
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      throw new Error('Failed to fetch sales data');
    }

    // 응답 데이터를 JSON 형태로 변환
    const fetchedData = await response.json();
    console.log("Fetched Sales Data:", fetchedData);

    // 매출 데이터 배열을 가져옴
    const salesDataArray = fetchedData.salesData;
    if (!Array.isArray(salesDataArray) || salesDataArray.length === 0) {
      console.warn('선택한 기간에 대한 매출 데이터가 없습니다.');
      setChartDataList([]);
      return;
    }

    // 선택한 매장의 이름 설정 (storeList 배열에서 해당 매장 정보 찾기)
    let storeName = "매장명 불러오기 실패";
    const storeInfo = storeList.find(store => store.storeId === selectedStore);
    if (storeInfo) {
      storeName = storeInfo.storeName;
    } else if (salesDataArray.length > 0) {
      storeName = salesDataArray[0].storeName || "매장명 없음";
    }

    // 차트 데이터 배열 초기화
    const chartDataList = [];

    // 날짜별 조회 또는 월 전체 조회일 경우
    if (isDateChecked || (isMonthChecked && !isDateChecked)) {
      // 일별 매출 데이터 생성
      const dailySalesData = salesDataArray.map(item => {
        if (item.date && item.totalSales !== undefined) {
          return {
            date: item.date,
            sales: item.totalSales
          };
        }
        return null;
      }).filter(item => item !== null);

      // 일별 매출 데이터가 있는 경우 차트 데이터 생성
      if (dailySalesData.length > 0) {
        const chartData = {
          labels: dailySalesData.map(item => item.date), // X축 라벨 (날짜)
          datasets: [{
            label: `${storeName} 일별 매출`, // 차트 라벨
            data: dailySalesData.map(item => item.sales), // Y축 데이터 (매출)
            fill: false, // 그래프 채우기 비활성화
            borderColor: 'rgba(75,192,192,1)', // 그래프 선 색상
            tension: 0.1, // 그래프 선의 곡선 정도
          }]
        };
        chartDataList.push(chartData); // 차트 데이터 리스트에 추가
      } else {
        console.warn('일별 매출 데이터가 없습니다.');
      }
    } else {
      // 월별 매출 데이터 생성
      const monthlySalesData = salesDataArray.map(item => {
        if (item.month !== undefined && item.totalSales !== undefined) {
          return {
            month: `${item.month}월`,
            sales: item.totalSales
          };
        }
        return null;
      }).filter(item => item !== null);

      // 월별 매출 데이터가 있는 경우 차트 데이터 생성
      if (monthlySalesData.length > 0) {
        const chartData = {
          labels: monthlySalesData.map(item => item.month), // X축 라벨 (월)
          datasets: [{
            label: `${storeName} 월별 매출`, // 차트 라벨
            data: monthlySalesData.map(item => item.sales), // Y축 데이터 (매출)
            fill: false, // 그래프 채우기 비활성화
            borderColor: 'rgba(75,192,192,1)', // 그래프 선 색상
            tension: 0.1, // 그래프 선의 곡선 정도
          }]
        };
        chartDataList.push(chartData); // 차트 데이터 리스트에 추가
      } else {
        console.warn('월별 매출 데이터가 없습니다.');
      }
    }
    

    // 차트 데이터가 없는 경우 경고 메시지 출력 후 함수 종료
    if (chartDataList.length === 0) {
      console.warn('선택한 기간에 대한 매출 데이터가 없습니다.');
      setChartDataList([]);
      return;
    }

    // 차트 데이터 설정 및 조회 상태를 true로 변경
    setChartDataList(chartDataList);
    setIsSalesViewed(true);
  } catch (error) {
    // 에러가 발생한 경우 콘솔에 에러 메시지 출력
    console.error('Error fetching sales data:', error);
  }
};

const handleProductSearch = async () => {
  try {
    setIsLoading(true); // 로딩 시작
    let endpoint = `http://10.125.121.188:8080/api/sales/top-products`;
    const queryParams = [];

    if (isYearChecked) {
      queryParams.push(`year=${startYear}`);
    }

    if (isMonthChecked) {
      const fromMonth = String(startMonth).padStart(2, '0');
      const toMonth = String(startMonth).padStart(2, '0');
      queryParams.push(`fromMonth=${fromMonth}`);
      queryParams.push(`toMonth=${toMonth}`);
    }

    if (isDateChecked) {
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      queryParams.push(`startDate=${startDateStr}`);
      queryParams.push(`endDate=${endDateStr}`);
    }

    if (selectedStore) {
      queryParams.push(`storeId=${selectedStore}`);
    }

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

    console.log("상품 조회 API 요청 URL:", endpoint);

    const response = await fetch(endpoint, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }

    const productData = await response.json();
    console.log("Fetched Product Data:", productData);

    const productList = productData.map(product => (
      <div key={product.productId} className="product-item" onClick={() => handleProductClick(product.productId)}>
        <div className="product-image-container">
          {product.pimgPath ? (
            <img 
              src={`http://10.125.121.188:8080${product.pimgPath}`} 
              alt={product.productName} 
              className="product-image" 
            />
          ) : (
            <div className="product-image-placeholder">이미지 없음</div>
          )}
        </div>
        <div className="product-info">
          <p className="product-name">{product.productName}</p>
          <p className="product-quantity">판매량: {product.totalQuantity}</p>
        </div>
      </div>
    ));

    setProductDisplay(productList);
  } catch (error) {
    console.error('Error fetching product data:', error);
  } finally {
    setIsLoading(false); // 로딩 종료
  }
};

const handleProductClick = async (productId) => {
  try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      setActiveItem(productId);

      // API 요청 URL 설정
      let endpoint = `http://10.125.121.188:8080/api/admin/recommend-products?year=${startYear}&month=${startMonth}`;
      
      if (startDate) {
          endpoint += `&day=${startDate.getDate()}`;
      }
      if (selectedStore) {
          endpoint += `&storeId=${selectedStore}`;
      }

      console.log("추천 아이템 API 요청 URL:", endpoint);

      const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // 토큰을 Authorization 헤더에 추가
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch recommended products');
      }

      const recommendationData = await response.json();
      console.log("Fetched Recommendation Data:", recommendationData);

      // recommendationData의 첫 번째 요소에서 category에 접근
      const data = recommendationData[0];

      // if (!data || !data.category) {
      //     console.error("Category data is missing:", data);
      //     return;
      // }

      // category의 항목들을 가져와 콘솔에 출력 및 렌더링
      const recommendedItems = Object.entries(data.category).map(([key, item], index) => {
          console.log(`Recommended Item ${index + 1}:`);
          console.log(`Name: ${item.name}`);
          console.log(`Image Path: ${item.pimgPath}`);
          console.log(`Price: ${item.price}`);
          console.log(`Review Count: ${item.review_count}`);
          console.log(`Seller URL: ${item.seller_url}`);

          return (
              <div key={key} className="recommended-item">
                  <a href={item.seller_url} target="_blank" rel="noopener noreferrer">
                      <img src={item.pimgPath} alt={item.name} className="recommended-item-image" />
                      <p className="recommended-item-name">{item.name}</p>
                      <p className="recommended-item-price">가격: {item.price}원</p>
                      <p className="recommended-item-reviews">리뷰 수: {item.review_count}</p>
                  </a>
              </div>
          );
      });

      setRelatedItems(recommendedItems);
  } catch (error) {
      console.error('Error fetching recommended products:', error);
  }
};

  const handleReset = () => {
    window.location.reload();
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
        <select
            className="storemanage-dropdown wide"
            value={selectedStore}
            onChange={(e) => {
              const storeId = e.target.value;
              const store = storeList.find(s => s.storeId === storeId);
              setSelectedStore(storeId);
              setSelectedStoreName(store ? store.storeName : ''); // 매장 이름을 상태에 저장
            }}
          >
            <option value="">매장 선택</option>
            {storeList.map((store) => (
              <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
            ))}
          </select>

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
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              disabled={!isYearChecked}
            >
              <option value={2023}>2023년</option>
              <option value={2024}>2024년</option>
            </select>
            
            <label>

            <input
              type="checkbox"
              className="circle-checkbox"
              checked={isMonthChecked}
              onChange={() => setIsMonthChecked(!isMonthChecked)}
              disabled={!isYearChecked} // 연도 선택이 체크되지 않은 경우 비활성화
            />
            월
          </label>

          <select
            className="storemanage-dropdown"
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            disabled={!isMonthChecked}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>

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
            dateFormat="yyyy.MM.dd"
            customInput={<CustomInput />}
            placeholderText="시작 날짜" // 기본 안내 텍스트
            disabled={!isDateChecked}
          />

          <span> ~ </span>

          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy.MM.dd"
            customInput={<CustomInput />}
            placeholderText="종료 날짜" // 기본 안내 텍스트
            disabled={!isDateChecked}
          />

            <button className="storemanage-search-button" style={{ marginLeft: '10px' }} onClick={handleSalesSearch}>매출 조회</button>
            
            <button className="storemanage-search-button" onClick={handleProductSearch}>상품 조회</button>
            
            <button className="storemanage-search-button" onClick={handleReset}>다시 조회</button>
          </div>
        </div>

        


        {chartDataList.length > 0 && (
          <div className={`storemanage-sales-charts ${chartDataList.length === 1 ? 'storemanage-single-chart' : ''}`}>
            {chartDataList.map((chartData, index) => (
              <div className="storemanage-sales-chart" key={index}>
                <h6>{chartData.datasets[0].label || '매장 매출 차트'}</h6>
                  <Line
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                      y: {
                        ticks: {
                          font: {
                            size: 8 // Y축 라벨의 글자 크기 설정
                          }
                        }
                      }
                    },
                    plugins: {
                      title: {
                        display: true,
                        padding: {
                          top: 10,
                          bottom: 30
                        },
                        font: {
                          size: 8 // 타이틀의 글자 크기
                        }
                      }
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}

      {showProductSearch && (
              <div className="product-display-section">
                <h2 className="product-display-title">상품 조회</h2>
                <div className="product-items-container">
                  {productDisplay}
                </div>
              </div>
            )}

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
import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어 로케일 import
import { Line, Doughnut } from 'react-chartjs-2';
import Admheader from '../Admins/Admheader';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,



  
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../CSS/Manager.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

registerLocale('ko', ko);

const Manager = () => {
  const [totalMembers, setTotalMembers] = useState(0);
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [inquiries, setInquiries] = useState(0);
  const [inquiryReplies, setInquiryReplies] = useState(0);
  const [orderList, setOrderList] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [chartType, setChartType] = useState('realtime');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [visibleOrders, setVisibleOrders] = useState(5);
  const [sortedData, setSortedData] = useState([]);
  const [filteredData, setFilteredData] = useState({
    labels: [],
    datasets: [{ label: '일별 매출', data: [] }],
  });
  const [doughnutData, setDoughnutData] = useState({
    labels: [],
    datasets: [{
      label: '카테고리별 판매율',
      data: [],
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 159, 64, 0.5)',
        'rgba(128, 0, 128, 0.5)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(128, 0, 128, 1)',
      ],
      borderWidth: 1,
    }],
  });


 // 일별 매출 조회 함수 수정
const fetchDailySales = async () => {
  const startDate = '2023-10-03';
  const endDate = '2024-10-02';
  const url = `http://10.125.121.188:8080/api/admin/sales/daily?startDate=${startDate}&endDate=${endDate}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const recentData = sortedData.slice(-7);

      setFilteredData({
        labels: recentData.map(item => format(new Date(item.date), 'MM/dd')),
        datasets: [{
          label: '일별 매출',
          data: recentData.map(item => item.totalSales),
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        }]
      });
    } else {
      console.error('Failed to fetch daily sales:', response.statusText);
    }
  } catch (error) {
    console.error('API 호출 중 에러 발생:', error);
  }
};

  const fetchMonthlySales = async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const url = `http://10.125.121.188:8080/api/admin/sales/monthly?startDate=${startDate}&endDate=${endDate}`;
  
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFilteredData({
          labels: data.map(item => format(new Date(item.date), 'MMMM', { locale: ko })), // 한국어 로케일 적용
          datasets: [{
            label: '월별 누적 매출',
            data: data.map(item => item.totalSales),
            borderColor: 'rgba(255,99,132,1)',
            tension: 0.1,
          }]
        });
      } else {
        console.error('월별 매출 데이터를 가져오는데 실패했습니다:', response.statusText);
      }
    } catch (error) {
      console.error('월별 매출 데이터 조회 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (chartType === 'realtime' && startDate && endDate) {
      fetchDailySales();
    } else if (chartType === 'cumulative' && startDate && endDate) {
      fetchMonthlySales();
    }
  }, [chartType, startDate, endDate]);

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          boxWidth: 10,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || '';
            if (label === '기타') {
              // 기타 항목 이름들을 2줄로 나누어 표시
              const otherCategoryNames = sortedData.slice(5).map(([name]) => name);
              const half = Math.ceil(otherCategoryNames.length / 2); 
              const firstHalf = otherCategoryNames.slice(0, half).join(', ');
              const secondHalf = otherCategoryNames.slice(half).join(', ');
              return [`기타 항목: ${firstHalf}`, secondHalf];
            }
            return `${label}: ${tooltipItem.raw.toLocaleString()}원`;
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  useEffect(() => {
    fetchTotalMembers();
    fetchDailyVisitors();
    fetchCustomerInquiries();
    fetchInquiryReplies();
    fetchOrdersFromSession(); // 세션의 주문 목록을 가져오는 기존 코드
    fetchOrders(); // 새로운 주문 목록 API 호출 추가
    fetchCategorySales();
  }, []);

  const fetchCategorySales = async () => {
    try {
      const response = await fetch('http://10.125.121.188:8080/api/admin/sales/category-percentage');
      if (response.ok) {
        const data = await response.json();
        const sortedDataArray = Object.entries(data).sort(([, a], [, b]) => b - a);
        const top5 = sortedDataArray.slice(0, 5);
        const others = sortedDataArray.slice(5);
  
        const labels = top5.map(item => item[0]);
        const salesData = top5.map(item => item[1]);
  
        const otherTotal = others.reduce((sum, [, value]) => sum + value, 0);
        labels.push('기타');
        salesData.push(otherTotal);
  
        setDoughnutData({
          labels: labels,
          datasets: [{
            label: '카테고리별 판매율',
            data: salesData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          }],
        });
  
        setSortedData(sortedDataArray); // sortedData 업데이트
      } else {
        console.error('카테고리별 판매율 데이터를 가져오는 데 실패했습니다:', response.statusText);
      }
    } catch (error) {
      console.error('카테고리별 판매율 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  // 주문 상태를 한국어로 변환하는 함수
const convertStatusToKorean = (status) => {
  switch (status) {
    case 'PENDING':
      return '처리 대기';
    case 'PROCESSING':
      return '처리 중';
    case 'SHIPPED':
      return '배송 중';
    case 'DELIVERED':
      return '배송 완료';
    case 'CANCELLED':
      return '주문 취소';
    default:
      return status;
  }
};

const convertStatusToEnglish = (status) => {
  switch (status) {
    case '처리 대기':
      return 'PENDING';
    case '처리 중':
      return 'PROCESSING';
    case '배송 중':
      return 'SHIPPED';
    case '배송 완료':
      return 'DELIVERED';
    case '주문 취소':
      return 'CANCELLED';
    default:
      return '';
  }
};

const fetchOrders = async () => {
  try {
    const response = await fetch('http://10.125.121.188:8080/api/admin/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched Order Data:', data); // 주문 데이터를 콘솔에 출력

      const formattedOrders = data.map((order) => ({
        orderId: order.orderId,
        userId: order.username, // API에서 가져온 username을 userId로 매핑
        productInfo: '상품 정보 없음', // API 응답에 상품 정보가 없으므로 기본값으로 설정
        totalPrice: `${order.totalAmount.toLocaleString()}원`, // totalAmount를 totalPrice로 매핑
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        deliveryStatus: convertStatusToKorean(order.orderStatus), // 한국어로 변환
        size: 'N/A', // 해당 정보가 없으므로 기본값 설정
        quantity: 0, // 해당 정보가 없으므로 기본값 설정
      }));
      
      setOrderList(formattedOrders);
    } else {
      console.error('주문 목록을 가져오는 데 실패했습니다:', response.statusText);
    }
  } catch (error) {
    console.error('주문 목록을 가져오는 중 오류 발생:', error);
  }
};


  const fetchTotalMembers = async () => {
    try {
      const response = await fetch('http://10.125.121.188:8080/api/admin/members/count');
      if (response.ok) {
        const data = await response.json();
        setTotalMembers(data);
      } else {
        console.error('Failed to fetch total members:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching total members:', error);
    }
  };

  const fetchDailyVisitors = async () => {
    try {
      const response = await fetch('http://10.125.121.188:8080/api/visitors/count');
      if (response.ok) {
        const data = await response.json();
        setDailyVisitors(data);
      } else {
        console.error('Failed to fetch daily visitors:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching daily visitors:', error);
    }
  };

  const fetchCustomerInquiries = async () => {
    try {
      const response = await fetch('http://10.125.121.188:8080/api/admin/qboards/count');
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      } else {
        console.error('Failed to fetch customer inquiries:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching customer inquiries:', error);
    }
  };

  const fetchInquiryReplies = async () => {
    try {
      const response = await fetch('http://10.125.121.188:8080/api/admin/comments/admin/count');
      if (response.ok) {
        const data = await response.json();
        setInquiryReplies(data);
      } else {
        console.error('Failed to fetch inquiry replies:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching inquiry replies:', error);
    }
  };

  const fetchOrdersFromSession = () => {
    const storedOrderItems = JSON.parse(sessionStorage.getItem('orderItems')) || [];
    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo')) || {};
    const orderNumber = orderInfo.orderNumber || 'N/A';
    const orderDate = orderInfo.orderDate || new Date().toLocaleDateString();
    const orderStatus = '배송 준비';

    const formattedOrders = storedOrderItems.map((item, index) => ({
      orderId: orderNumber + '-' + (index + 1),
      userId: '사용자ID',
      productInfo: item.name,
      totalPrice: `${(item.price * item.quantity).toLocaleString()}원`,
      orderDate: orderDate,
      deliveryStatus: orderStatus,
      size: item.size,
      quantity: item.quantity,
    }));

    setOrderList(formattedOrders);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
        // 주문 상태를 영어로 변환
        const statusInEnglish = convertStatusToEnglish(newStatus);

        console.log(`Updating order status: Order ID: ${orderId}, New Status: ${statusInEnglish}`); // 상태 변경 정보 콘솔 출력
  
        const response = await fetch(`http://10.125.121.188:8080/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: statusInEnglish }), // JSON 형식으로 전달
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            setOrderList((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === orderId ? { ...order, deliveryStatus: newStatus } : order
                )
            );
        } else {
            const errorText = await response.text();
            console.error('주문 상태 업데이트 중 오류 발생:', errorText);
        }
    } catch (error) {
        console.error('주문 상태 업데이트 중 오류 발생:', error);
    }
};

  const handleDeleteClick = async () => {
    try {
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const response = await fetch(`http://10.125.121.188:8080/api/admin/orders/${orderId}/cancel`, {
            method: 'PUT',
          });
          if (!response.ok) {
            console.error(`주문 취소 중 오류 발생 (Order ID: ${orderId}):`, response.statusText);
          }
        })
      );

      setOrderList(orderList.filter(order => !selectedOrders.includes(order.orderId)));
      setSelectedOrders([]);
    } catch (error) {
      console.error('주문 취소 중 오류 발생:', error);
    }
  };

  const handleSaveClick = () => {
    alert('저장되었습니다.');
  };

  const handleSearchClick = async () => {
    if (startDate && endDate) {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const apiUrl = `http://10.125.121.188:8080/api/admin/sales/daily?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
  
      console.log(`API 요청 URL: ${apiUrl}`);
  
      try {
        const response = await fetch(apiUrl);
  
        if (response.ok) {
          const data = await response.json();
          console.log("API로부터 받은 데이터:", data);
  
          // 가져온 데이터를 그대로 설정
          setFilteredData({
            labels: data.map(item => format(new Date(item.date), 'MM/dd')),
            datasets: [{
              label: '일별 매출',
              data: data.map(item => item.totalSales),
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.1,
            }]
          });
        } else {
          console.error('데이터 요청에 실패했습니다:', response.statusText);
        }
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error);
      }
    } else {
      console.warn('시작 날짜와 종료 날짜를 모두 선택하세요.');
    }
  };



  // Checkbox 선택/해제 함수 추가
const handleCheckboxChange = (orderId) => {
  setSelectedOrders((prevSelected) =>
    prevSelected.includes(orderId)
      ? prevSelected.filter((id) => id !== orderId)
      : [...prevSelected, orderId]
  );
};

const handleLoadMore = () => {
  setVisibleOrders(prevVisible => prevVisible + 25);
};

  return (
    <div>
      <Admheader />
      <div className="manager-dashboard-container">
        <h1 className="manager-dashboard-title">DashBoard</h1>
        <p className="manager-dashboard-welcome-text">이 페이지는 관리자만 이용 가능합니다.</p>

        <div className="manager-dashboard-stats">
          <div className="manager-dashboard-stat-box">
            <p>총 회원 수</p>
            <p>{totalMembers}</p>
          </div>
          <div className="manager-dashboard-stat-box">
            <p>총 방문자 수</p>
            <p>{dailyVisitors}</p>
          </div>
          <div className="manager-dashboard-stat-box">
            <p>고객 문의</p>
            <p>{inquiries}</p>
          </div>
          <div className="manager-dashboard-stat-box">
            <p>문의 답변</p>
            <p>{inquiryReplies}</p>
          </div>
        </div>

        <div className="chart-type-and-filter">
          <div className="chart-type-buttons">
            <button onClick={() => setChartType('realtime')}>일일 매출 보고서</button>
            <button onClick={() => setChartType('cumulative')}>월별 매출 보고서</button>
          </div>
          <div className="search-filter-inline">
            <DatePicker
              locale="ko"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy.MM.dd"
              placeholderText="시작 날짜"
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
            <span> ~ </span>
            <DatePicker
              locale="ko"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy.MM.dd"
              placeholderText="종료 날짜"
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
            <button onClick={handleSearchClick}>조회</button>
          </div>
        </div>

        <div className="manager-dashboard-charts">
          <div className="manager-dashboard-chart">
            <p>{chartType === 'realtime' ? '일일 매출' : '월별 매출'}</p>
            <Line data={filteredData} />
          </div>
          <div className="manager-dashboard-chart">
            <p>카테고리별 판매율</p>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="manager-dashboard-order">
          <div className="manager-dashboard-order-header">
            <h2>주문 목록</h2>
            <div className="manager-dashboard-order-actions">
              <button className="save-button" onClick={handleSaveClick}>저장</button>
              <button className="delete-button" onClick={handleDeleteClick}>삭제</button>
            </div>
          </div>
        </div>
        
        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table className="manager-dashboard-order-table">
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
              <tr>
                <th></th>
                <th>주문 번호</th>
                <th>사용자 아이디</th>
                <th>상품 정보</th>
                <th>총 가격</th>
                <th>주문 일자</th>
                <th>배송 상태</th>
              </tr>
            </thead>
            <tbody>
            {orderList.length > 0 ? (
                orderList.slice(0, visibleOrders).map(order => (
                  <tr key={order.orderId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.orderId)}
                        onChange={() => handleCheckboxChange(order.orderId)}
                      />
                    </td>
                    <td>{order.orderId}</td>
                    <td>{order.userId}</td>
                    <td>{order.productInfo}</td>
                    <td>{order.totalPrice}</td>
                    <td>{order.orderDate}</td>
                    <td>
                      <select
                        value={order.deliveryStatus || "처리 대기"}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      >
                        <option value="처리 대기">처리 대기</option>
                        <option value="처리 중">처리 중</option>
                        <option value="배송 중">배송 중</option>
                        <option value="배송 완료">배송 완료</option>
                        <option value="주문 취소">주문 취소</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>주문 목록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {visibleOrders < orderList.length && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button onClick={handleLoadMore}>더보기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manager;
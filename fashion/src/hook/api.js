export const fetchAPI = async (endpoint, options = {}) => {
  const baseURL = process.env.REACT_APP_API_URL.endsWith('/')
    ? process.env.REACT_APP_API_URL.slice(0, -1)
    : process.env.REACT_APP_API_URL;

  const url = endpoint.startsWith('/') || endpoint.startsWith('?') || endpoint === ''
    ? baseURL + endpoint
    : `${baseURL}/${endpoint}`;

  let accessToken = localStorage.getItem('accessToken');
  const tokenExpiration = localStorage.getItem('tokenExpiration');

  console.log('Initial Access Token:', accessToken); // Initial token logging

  // 토큰 만료 확인 및 1분 전에 자동 갱신 로직 추가
  if (tokenExpiration) {
    const currentTime = Date.now();
    const expirationTime = parseInt(tokenExpiration, 10);

    console.log('Current Time:', currentTime);
    console.log('Expiration Time:', expirationTime);

    // 만료 시간 1분 전인지 확인 (1분 = 60,000ms)
    if (expirationTime - currentTime <= 60 * 1000) {
      console.log('Token is about to expire, refreshing...');
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        accessToken = localStorage.getItem('accessToken'); // 갱신된 토큰 사용
        console.log('Refreshed Access Token:', accessToken); // After token refresh
      } else {
        throw new Error('Failed to refresh access token');
      }
    }
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}` }),
  };
  

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  console.log("header",defaultHeaders)
  console.log('Request URL:', url);

  try {
    let response = await fetch(url, mergedOptions);

    // If token is expired or unauthorized, try to refresh the token
    if (response.status === 401) {
      console.log('Received 401, attempting to refresh the token...');
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        accessToken = localStorage.getItem('accessToken'); // 새로운 토큰 가져오기
        mergedOptions.headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Retrying request with refreshed token:', accessToken);
        response = await fetch(url, mergedOptions); // API 재요청
      }
    }
    if (!response.ok) {
      const errorMessage = `Failed to fetch: ${url}, Status: ${response.status}, ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error during API call:', error); // Log error
    throw error;
  }
};
// 토큰 갱신 함수
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 이 경우에도 JSON 헤더는 유지 (문자열을 JSON으로 다룸)
      },
      body: JSON.stringify(refreshToken), // 객체 대신 refreshToken을 문자열로 전송
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('tokenExpiration', data.accessExpiration); // 새로운 만료 시간 저장
      return true;
    } else {
      localStorage.clear();
      console.log("세션이 만료되었습니다. 다시 로그인하세요.");
      return false;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    localStorage.clear();
    return false;
  }
};



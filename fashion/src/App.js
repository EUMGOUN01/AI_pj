import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './Component/Mainpage/Header';
import Footer from './Component/Mainpage/Footer';
import Signup from './Component/Singup/Signup';
import Login from './Component/Login/Login';
import FaAnalysis from './Component/Analysis/FaAnalysis';
import Completion from './Component/Singup/Completion';
import Board from './Component/Question/Board';
import Writing from './Component/Question/Writing';
import View from './Component/Question/View';
import Modify from './Component/Question/Modify';
import User from './Component/Login/User';
import Pass from './Component/Login/Pass';
import PassCheck from './Component/Login/PassCheck';
import RePass from './Component/Login/RePass';
import UserFind from './Component/Login/UserFind';
import MyPages from './Component/MyPage/MyPages';
import Baskets from './Component/Cart/Baskets';
import Payment from './Component/Cart/Payment';
import PayCompleted from './Component/Cart/PayCompleted';
import Order from './Component/MyPage/Order';
import MyOrder from './Component/MyPage/MyOrder';
import Product from './Component/Eproduct/Product';
import ProductDetails from './Component/Eproduct/ProductDetails';
import Manager from './Component/MyPage/Manager';
import Admheader from './Component/Admins/Admheader';
import Home from "./Component/Mainpage/Home";
import Managers from './Component/Admins/Managers';
import Storemanage from './Component/Admins/Storemanage';
import FloatingCircle from './Component/Mainpage/FloatingCircle';
import AnotherFloatingCircle from './Component/Mainpage/AnotherFloatingCircle';
import ReactGA from 'react-ga4';

const TrackPageView = () => {
    const location = useLocation();

    useEffect(() => {
        // 라우트가 변경될 때마다 GA에 페이지뷰를 보내는 로직
        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [location]);

    return null; // 컴포넌트를 렌더링할 필요는 없기 때문에 null을 반환
};

function App() {
    const location = useLocation();
    const noHeaderFooterRoutes = ['/admin', '/manager', '/managers', '/storemanage'];
    const userRole = localStorage.getItem('role'); // 로그인 유저의 role 정보를 가져옵니다.

    useEffect(() => {
        ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
    }, []);

    return (
        <div>
            {!noHeaderFooterRoutes.includes(location.pathname) && <Header />}
            <div className="main-content">
                <TrackPageView />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/analysis" element={<FaAnalysis />} />
                    <Route path="/qna" element={<Board />} />
                    <Route path="/write" element={<Writing />} />
                    <Route path="/qna/:id" element={<View />} />
                    <Route path="/qna/modify/:id" element={<Modify />} />
                    <Route path="/find-username" element={<User />} />
                    <Route path="/find-password" element={<Pass />} />
                    <Route path="/verify" element={<Completion />} />
                    <Route path="/passcheck" element={<PassCheck />} />
                    <Route path="/reset-password" element={<RePass />} />
                    <Route path="/userfind" element={<UserFind />} />
                    <Route path="/mypage" element={<MyPages />} />
                    <Route path="/cart" element={<Baskets />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/paycompleted" element={<PayCompleted />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/myorder" element={<MyOrder />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/admin" element={<Admheader />} />
                    <Route path="/manager" element={<Manager />} />
                    <Route path="/managers" element={<Managers />} />
                    <Route path="/storemanage" element={<Storemanage />} />
                </Routes>
            </div>
            {!noHeaderFooterRoutes.includes(location.pathname) && <Footer />}
            {!noHeaderFooterRoutes.includes(location.pathname) && (
                <>
                    <AnotherFloatingCircle />
                    {userRole === 'ADMIN' && <FloatingCircle />}
                </>
            )}
        </div>
    );
}

export default function AppWithRouter() {
    return (
        <Router>
            <App />
        </Router>
    );
}
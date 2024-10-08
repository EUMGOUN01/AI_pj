import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../../CSS/FloatingCircle.css';

const FloatingCircle = () => {
    const navigate = useNavigate();
  
    const handleClick = () => {
      navigate('/manager'); // '/manager' 페이지로 이동
    };
  
    return (
      <div className="floating-circle" onClick={handleClick}>
        <FontAwesomeIcon icon={faGear} className="icon" />
      </div>
    );
  };
  
  export default FloatingCircle;
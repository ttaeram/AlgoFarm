import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button className="backButton" onClick={handleBack}>
      뒤로가기
    </button>
  );
};

export default BackButton;

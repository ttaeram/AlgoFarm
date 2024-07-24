import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectGroup.css'

const SelectGroup = () => {
  const navigate = useNavigate();

  return (
    <div className="selectGroup">
      <h1 className="title">알고팜</h1>
      <div className="algoFarm">
        <img src="" alt="algoFarm" />
      </div>
      <div className="buttonContainer">
        <button className="button" onClick={() => navigate('/create-group')}>그룹 생성</button>
        <button className="button" onClick={() => navigate('/join-group')}>그룹 참가</button>
      </div>
    </div>
  );
}

export default SelectGroup;

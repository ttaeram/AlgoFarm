import React from "react";
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="group-info" className={({ isActive }) => (isActive ? "active" : undefined)}>그룹 정보</NavLink>
      <NavLink to="member-info" className={({ isActive }) => (isActive ? "active" : undefined)}>그룹원 정보</NavLink>
      <NavLink to="char-info" className={({ isActive }) => (isActive ? "active" : undefined)}>캐릭터 정보</NavLink>
      <NavLink to="settings" className={({ isActive }) => (isActive ? "active" : undefined)}>더보기...</NavLink>
    </nav>
  );
}

export default Navbar;

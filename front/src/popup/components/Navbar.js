import { NavLink } from 'react-router-dom';
import * as styles from './Navbar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <NavLink to="group-info" className={styles.button}>
        <svg
          class="icon"
          stroke="currentColor"
          fill="none"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </NavLink>
      <NavLink to="member-info" className={({ isActive }) => (isActive ? styles.active : undefined)}>그룹원 정보</NavLink>
      <NavLink to="member-manage" className={({ isActive }) => (isActive ? styles.active : undefined)}>그룹원 관리</NavLink>
      <NavLink to="settings" className={({ isActive }) => (isActive ? styles.active : undefined)}>더보기...</NavLink>
    </nav>
  );
}

export default Navbar;

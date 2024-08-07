import { NavLink } from 'react-router-dom';
import * as styles from './Navbar.module.css';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <input type="radio" name="tab" id="tab1" className={styles.tab_1} defaultChecked />
      <label className={styles.tab_label} htmlFor="tab1">
        <NavLink to="group-info">Group Info</NavLink>
      </label>
      
      <input type="radio" name="tab" id="tab2" className={styles.tab_2} />
      <label className={styles.tab_label} htmlFor="tab2">
        <NavLink to="member-info">Member Info</NavLink>
      </label>
      
      <input type="radio" name="tab" id="tab3" className={styles.tab_3} />
      <label className={styles.tab_label} htmlFor="tab3">
        <NavLink to="member-manage">Member Manage</NavLink>
      </label>
      
      <input type="radio" name="tab" id="tab4" className={styles.tab_4} />
      <label className={styles.tab_label} htmlFor="tab4">
        <NavLink to="settings">Settings</NavLink>
      </label>
      
      <div className={styles.indicator}></div>
    </nav>
  );
}

export default Navbar;

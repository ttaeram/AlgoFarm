import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/context";
import * as styles from "./LogoutButton.module.css"

const LogoutButton = () => {
  const { setIsLogined, signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    setIsLogined(false);  // 로그인 상태를 false로 설정
    signOut();
    navigate('/');
  };

  return (
    <div>
      <button className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
    </div>
  );
};

export default LogoutButton;
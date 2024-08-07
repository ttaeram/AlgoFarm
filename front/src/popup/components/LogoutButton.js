import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/context";
import { Button } from '@mui/material';
import * as styles from "./LogoutButton.module.css";

const LogoutButton = () => {
  const { setIsLogined, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLogined(false);  // 로그인 상태를 false로 설정
    signOut();
    navigate('/');
  };

  return (
    <Button
      className={styles.logoutButton}
      onClick={handleLogout}
      variant="contained"
      color="secondary"
    >
      로그아웃
    </Button>
  );
};

export default LogoutButton;

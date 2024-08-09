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

  // return (
  //   <Button
  //     className={styles.logoutButton}
  //     onClick={handleLogout}
  //     variant="contained"
  //     color="#eb647e"
  //   >
  //     로그아웃
  //   </Button>
  // );
  return (
    <Button
      className={styles.logoutButton}
      onClick={handleLogout}
      variant="contained"
      style={{ backgroundColor: '#eb647e' }}  // style 속성을 사용하여 배경색 지정
    >
      로그아웃
    </Button>
  );
};

export default LogoutButton;

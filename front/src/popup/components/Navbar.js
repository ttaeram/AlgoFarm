import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/system';
import { Settings, Home, Group, ManageAccounts } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CustomBottomNavigation = styled(BottomNavigation)`
  height: 50px;
  width: 500px;
  margin: 0 auto;
  background-color: limegreen;
`;

const CustomBottomNavigationAction = styled(BottomNavigationAction)`
  color: white;
  
  &.Mui-selected {
    color: #f0f0f0;
    font-size: 1.2em;
  }

  &.Mui-selected .MuiBottomNavigationAction-label {
    color: #f0f0f0;
  }
`;

function Navbar() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  return (
    <CustomBottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        switch (newValue) {
          case 0:
            navigate('group-info');
            break;
          case 1:
            navigate('member-info');
            break;
          case 2:
            navigate('member-manage');
            break;
          case 3:
            navigate('settings');
            break;
          default:
            break;
        }
      }}
      showLabels
      className='navbar'
    >
      <CustomBottomNavigationAction label="메인 페이지" icon={<Home />} />
      <CustomBottomNavigationAction label="스터디원 활동" icon={<Group />} />
      <CustomBottomNavigationAction label="스터디원 관리" icon={<ManageAccounts />} />
      <CustomBottomNavigationAction label="설정" icon={<Settings />} />
    </CustomBottomNavigation>
  );
}

export default Navbar;

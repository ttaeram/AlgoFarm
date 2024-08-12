import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './styles.css';

const theme = createTheme({
  typography: {
    fontFamily: '"Do Hyeon", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
// 팝업 상태를 저장하는 함수
function savePopupState() {
    chrome.storage.local.set({popupOpen: true});
}
// 팝업 상태를 복원하는 함수
function restorePopupState() {
    chrome.storage.local.get(['popupOpen'], (result) => {
        if (result.popupOpen) {
            window.onload = () => {
                window.open(chrome.runtime.getURL('popup.html'));
                chrome.storage.local.set({popupOpen: false});
            };
        }
    });
}
chrome.runtime.sendMessage({action: 'clearBadge'});

// 팝업이 열릴 때 상태 저장
//window.addEventListener('load', savePopupState);

// 팝업 상태 복원
//restorePopupState();

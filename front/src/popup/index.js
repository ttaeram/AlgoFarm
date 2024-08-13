import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './styles.css';

const theme = createTheme({
    typography: {
        fontFamily: '"Do Hyeon", sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#FFB6C1 #FFF0F5",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#FFF0F5",
                        width: 12,
                        borderRadius: 8,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#FFC8C6",
                        minHeight: 24,
                        border: "3px solid #FFF0F5",
                    },
                    "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                        backgroundColor: "#FFA07A",
                    },
                    "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "#FFA07A",
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#FFA07A",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "#FFF0F5",
                    },
                },
            },
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
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

import { useState, useEffect } from 'react';
import * as styles from './ToggleEnableButton.module.css';

// 로컬 스토리지에서 객체 가져오기 (크롬 확장 프로그램용)
const getObjectFromChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}

// 로컬 스토리지에 객체 저장하기 (크롬 확장 프로그램용)
const setObjectToChromeStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// 로컬 스토리지에서 객체 가져오기 (웹 애플리케이션용)
const getObjectFromLocalStorage = (key) => {
  return Promise.resolve(localStorage.getItem(key));
}

// 로컬 스토리지에 객체 저장하기 (웹 애플리케이션용)
const setObjectToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
  return Promise.resolve();
}

// 현재 환경이 Chrome 확장 프로그램인지 확인하는 함수
const isChromeExtension = () => {
  return typeof chrome !== "undefined" && typeof chrome.storage !== "undefined";
}

const ToggleButton = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fetchEnable = async () => {
      const enable = await getObjectFromChromeStorage('bjhEnable');
      setEnabled(enable !== false); // undefined일 경우 true로 처리
      toggleCharacterVisibility(enable !== false);
    };

    fetchEnable();
  }, []);

  const toggleCharacterVisibility = (isVisible) => {
    if (isChromeExtension()) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleVisibility", isVisible: isVisible});
      });
    }
  };

  const handleToggle = async () => {
    const newEnabled = !enabled;
    if (isChromeExtension()) {
      await setObjectToChromeStorage('bjhEnable', newEnabled);
    } else {
      await setObjectToLocalStorage('bjhEnable', newEnabled);
    }
    setEnabled(newEnabled);
    toggleCharacterVisibility(newEnabled);
    console.log(newEnabled ? "on" : "off");
  };

  return (
      <button onClick={handleToggle} className={`${styles.button} ${enabled ? styles.active : ''}`}>
        {enabled ? 'Disable' : 'Enable'}
      </button>
  );
}

export default ToggleButton;

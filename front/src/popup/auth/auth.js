import { loadGapiInsideDOM } from 'gapi-script';

// 현재 환경이 Chrome 확장 프로그램인지 확인하는 함수
export function isChromeExtension() {
  return typeof chrome !== "undefined" && typeof chrome.identity !== "undefined";
}

// 로그인 함수: Chrome 확장 프로그램과 일반 웹 애플리케이션에서 모두 사용 가능
export async function signIn() {
  if (isChromeExtension()) {
    return signInWithChrome();
  } else {
    return signInWithWeb();
  }
}

// 로그아웃 함수: Chrome 확장 프로그램과 일반 웹 애플리케이션에서 모두 사용 가능
export async function signOut() {
  if (isChromeExtension()) {
    return signOutWithChrome();
  } else {
    return signOutWithWeb();
  }
}

// 사용자 정보를 가져오는 함수: Google API를 통해 사용자 정보를 가져옴
export async function getUserInfo(token) {
  return fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    return response.json();
  });
}

// 구글 토큰을 우리 서버에 보내서 우리 서버의 엑세스 토큰을 받는 함수
export async function exchangeTokenForJwt(token) {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.jwt;
  } catch (error) {
    throw error;
  }
}

// 서버에서 사용자 정보를 받아오는 함수
export async function getServerUserInfo(jwt) {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

// Chrome 확장 프로그램 인증

// Chrome 확장 프로그램에서 로그인하는 함수
function signInWithChrome() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('Failed to get auth token'));
      }
    });
  });
}

// Chrome 확장 프로그램에서 로그아웃하는 함수
function signOutWithChrome() {
  return new Promise((resolve, reject) => {
    chrome.identity.clearAllCachedAuthTokens(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// 일반 웹 애플리케이션 인증

// Google API 클라이언트를 로드하는 함수
function loadGapi() {
  return new Promise((resolve, reject) => {
    loadGapiInsideDOM().then(() => {
      window.gapi.load('auth2', () => {
        resolve();
      });
    }).catch((error) => {
      reject(error);
    });
  });
}

// Google API 클라이언트를 초기화하는 함수
async function initGapi() {
  await loadGapi();
  return new Promise((resolve) => {
    window.gapi.auth2.init({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    }).then(() => {
      resolve();
    });
  });
}

// 일반 웹 애플리케이션에서 로그인하는 함수
async function signInWithWeb() {
  await initGapi();
  const authInstance = window.gapi.auth2.getAuthInstance();
  const googleUser = await authInstance.signIn();
  const token = googleUser.getAuthResponse().access_token;
  // 토큰
  console.log('Web Token:', token);
  return token;
}

// 일반 웹 애플리케이션에서 로그아웃하는 함수
async function signOutWithWeb() {
  await initGapi();
  const authInstance = window.gapi.auth2.getAuthInstance();
  await authInstance.signOut();
}

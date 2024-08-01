// 구글로부터 엑세스 토큰 받아오는 함수
export function signIn() {
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

// 사용자 정보를 받아오는 함수
export function getUserInfo(token) {
    return fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        return response.json();
    });
}

// 로그아웃 함수
export function signOut() {
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

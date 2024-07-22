// src/services/auth.ts
export interface UserInfo {
    oAuthId: string;
    name: string;
    email: string;
}

const SERVER_URL = 'http://localhost:8080';


//구글로부터 엑세스 토큰 받아오는 함수
export function signIn(): Promise<string> {
    console.log('signIn function called at:', new Date().toISOString());
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            console.log('getAuthToken callback triggered at:', new Date().toISOString());
            if (chrome.runtime.lastError) {
                console.error('Chrome identity error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else if (token) {
                console.log('Received access token:', token);
                resolve(token);
            } else {
                console.error('Failed to get auth token');
                reject(new Error('Failed to get auth token'));
            }
        });
    });
}


export function getUserInfo(token: string): Promise<UserInfo> {
    return fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        return response.json() as Promise<UserInfo>;
    });
}

export function signOut(): Promise<void> {
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
export async function exchangeTokenForJwt(token: string): Promise<string> {
    try {
        const response = await fetch(`${SERVER_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.jwt;
    } catch (error) {
        console.error('Error in exchangeTokenForJwt:', error);
        throw error;
    }
}

export async function getServerUserInfo(jwt: string): Promise<UserInfo> {
    try {
        const response = await fetch(`${SERVER_URL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json() as Promise<UserInfo>;
    } catch (error) {
        console.error('Error in getServerUserInfo:', error);
        throw error;
    }
}

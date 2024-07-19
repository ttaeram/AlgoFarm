export interface UserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

export function signIn(): Promise<string> {
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
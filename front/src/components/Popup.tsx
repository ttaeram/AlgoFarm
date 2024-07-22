import React, { useState } from 'react';
import { signIn, signOut, getServerUserInfo, UserInfo, exchangeTokenForJwt } from '../services/auth';

const Popup: React.FC = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        if (isLoading) {
            console.log('Sign in process already in progress');
            return;
        }
        setIsLoading(true);
        try {
            console.log('Starting sign in process...');
            const googleToken = await signIn();
            console.log('Received Google token:', googleToken.substring(0, 5) + '...');

            console.log('Exchanging token for JWT...');
            const serverJwt = await exchangeTokenForJwt(googleToken);
            console.log('Received server JWT:', serverJwt.substring(0, 5) + '...');
            setJwt(serverJwt);

            console.log('Fetching user info...', serverJwt);
            const userInfo = await getServerUserInfo(serverJwt);
            console.log('Received user info:', userInfo);
            setUser(userInfo);

            console.log('Sign in process completed successfully');
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setJwt(null);
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div>
            {user ? (
                <div>
                    <p>Welcome, {user.name}!</p>
                    <p>Email: {user.email}</p>
                    <p>OAuth ID: {user.oAuthId}</p>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <button onClick={handleSignIn} disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In with Google'}
                </button>
            )}
        </div>
    );
};

export default Popup;
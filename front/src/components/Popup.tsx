import React, { useState } from 'react';
import { signIn, signOut, getUserInfo, UserInfo } from '../services/auth';

const Popup: React.FC = () => {
    const [user, setUser] = useState<UserInfo | null>(null);

    const handleSignIn = async () => {
        try {
            const token = await signIn();
            const userInfo = await getUserInfo(token);
            setUser(userInfo);
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
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
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <button onClick={handleSignIn}>Sign In with Google</button>
            )}
        </div>
    );
};

export default Popup;
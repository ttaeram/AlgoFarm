import React from 'react';
import Popup from './components/Popup';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <Popup />
      </div>
    </AuthProvider>
  );
};

export default App;

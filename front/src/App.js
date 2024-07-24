import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Popup from './components/Popup';
import SelectGroup from './pages/SelectGroup';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import MyPage from './pages/MyPage';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Popup />} />
          <Route path="/select-group" element={<SelectGroup />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/my-page/*" element={<MyPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SelectGroup from './pages/SelectGroup';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import MyPage from './pages/MyPage'
import { AuthProvider } from './context/context';
import Toggle from './components/Toggle';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
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

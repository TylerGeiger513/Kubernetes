// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatsUI from './pages/ChatsUI.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HomePage from './pages/HomePage.jsx'
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';

function App() {
  const [testMessage, setTestMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/tests')
      .then(response => response.json())
      .then(data => setTestMessage(data.message))
      .catch(err => setTestMessage('Error connecting to API'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<ChatsUI />} />
      </Routes>
    </Router>
  );
}

export default App;

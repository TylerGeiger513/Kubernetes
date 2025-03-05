// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ServerUI from './pages/ServerUI.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

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
        <Route path="/profile" element={<ProfilePage />} /> {/* Use element prop instead of component */}
        <Route path="/" element={<ServerUI />} />
      </Routes>
    </Router>
  );
}

export default App;

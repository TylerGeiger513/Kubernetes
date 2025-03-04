// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import ServerUI from './components/ServerUI.jsx';

function App() {
  const [testMessage, setTestMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/tests')
      .then(response => response.json())
      .then(data => setTestMessage(data.message))
      .catch(err => setTestMessage('Error connecting to API'));
  }, []);

  return (
    <div className="App">
      <ServerUI />
    </div>
  );
}

export default App;

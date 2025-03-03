// frontend/src/App.js
import React, { useEffect, useState } from 'react';

function App() {
  const [testMessage, setTestMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/tests')
      .then(response => response.json())
      .then(data => setTestMessage(data.message))
      .catch(err => setTestMessage('Error connecting to API'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Campus Connect Test</h1>
      <p>{testMessage}</p>
    </div>
  );
}

export default App;

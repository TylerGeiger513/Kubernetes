import React, { useEffect, useState } from 'react';

function App() {
  const [testMessage, setTestMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data); 
        setTestMessage(`Backend Status: ${data.status} | MongoDB: ${data.mongo} | Redis: ${data.redis}`);
      })
      .catch(err => {
        console.error('Error connecting to API:', err); 
        setTestMessage('Error connecting to API');
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Campus Connect Test</h1>
      <p>{testMessage}</p>
    </div>
  );
}

export default App;

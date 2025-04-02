import React from 'react';
import './App.css';
import UniversitySocialFeed from './components/UniversitySocialFeed';
import UniversityGroups from './components/UniversityGroups';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <div className="feed-column">
          <UniversitySocialFeed />
        </div>
        <div className="groups-column">
          <UniversityGroups />
        </div>
      </div>
    </div>
  );
}

export default App;
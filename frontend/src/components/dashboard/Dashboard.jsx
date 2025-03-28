import React, { useState } from 'react';
import ClassList from './ClassList';
import ChannelList from './ChannelList';
import DashboardContent from './DashboardContent';
import FriendsList from './FriendsList';
import '../../styles/Dashboard.css';
import Header from '../common/Header';

const Dashboard = () => {
  const [isFriendsCollapsed, setIsFriendsCollapsed] = useState(false);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <ClassList />
        <ChannelList />
        <DashboardContent />
        <FriendsList
          isCollapsed={isFriendsCollapsed}
          toggleCollapse={() => setIsFriendsCollapsed(!isFriendsCollapsed)}
        />
      </div>
    </>
  );
};

export default Dashboard;

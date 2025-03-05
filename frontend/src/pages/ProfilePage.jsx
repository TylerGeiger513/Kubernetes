import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import TopBar from '../components/TopBar'; 
import './ProfilePage.css';

const ProfilePage = () => {
  const [friends, setFriends] = useState(['alice', 'bob', 'charlie']); // Hardcoded friends
  const [newFriend, setNewFriend] = useState(''); // Input state for new friend
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup visibility
  const [selectedFriend, setSelectedFriend] = useState(null); // Selected friend for popup

  const handleAddFriend = () => {
    if (newFriend.trim()) {
      setFriends([...friends, newFriend.trim()]);
      setNewFriend('');
    }
  };

  const handleRemoveFriend = () => {
    setFriends(friends.filter((f) => f !== selectedFriend));
    setIsPopupOpen(false);
  };

  return (
    <div className="profile-page">
      <TopBar title="My Profile" />
      <div className="profile-content">
        <h2>Friends</h2>
        <div className="add-friend">
          <input
            type="text"
            placeholder="Enter username"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            className="friend-input"
          />
          <button onClick={handleAddFriend} className="add-button">
            Add Friend
          </button>
        </div>
        <div className="friends-list-container">
          <ul className="friends-list">
            {friends.map((friend) => (
              <li
                key={friend}
                className="friend-item"
                onClick={() => {
                  setSelectedFriend(friend);
                  setIsPopupOpen(true);
                }}
              >
                <div className="avatar">{friend.slice(-1)}</div>
                <span>{friend}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isPopupOpen && (
        <FriendPopup
          friend={selectedFriend}
          onClose={() => setIsPopupOpen(false)}
          onRemove={handleRemoveFriend}
        />
      )}
    </div>
  );
};

const FriendPopup = ({ friend, onClose, onRemove }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={onClose}>
        <FaTimes />
      </button>
      <div className="user-profile">
        <div className="profile-avatar">{friend.slice(-1)}</div>
        <h2>{friend}</h2>
        <button className="remove-button" onClick={onRemove}>
          Remove Friend
        </button>
      </div>
    </div>
  </div>
);

export default ProfilePage;
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './styles/FriendsList.css'; 

const FriendsList = () => {
  const [friends, setFriends] = useState(['alice', 'bob', 'charlie']);
  const [newFriend, setNewFriend] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

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
    <div className="friends-list-container">
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

      <div className="friends-list-wrapper">
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

      {isPopupOpen && (
        <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsPopupOpen(false)}>
              <FaTimes />
            </button>
            <div className="user-profile">
              <div className="profile-avatar">{selectedFriend?.slice(-1)}</div>
              <h2>{selectedFriend}</h2>
              <button className="remove-button" onClick={handleRemoveFriend}>
                Remove Friend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
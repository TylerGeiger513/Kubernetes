import React, { useState } from 'react';
import { School, Heart } from 'lucide-react';
import './UniversitySocialFeed.css';

const UniversitySocialFeed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'JOHN SMITH',
      department: 'Computer Science',
      imageUrl: 'https://t3.ftcdn.net/jpg/02/43/12/34/240_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg',
      content: [
        'Hey everyone,',
        'I participated in the West Chester Hackathon this weekend, and it was an electrifying experience! Collaborating with peers from different departments, we built a prototype for a campus safety app in just 24 hours. I can\'t wait to see how our idea evolves.'
      ],
      likes: 10,
      isLiked: false,
      tags: ['Computer Science', 'Hackathon']
    },
    {
      id: 2,
      author: 'Olivia Brown',
      department: 'Accounting',
      imageUrl: 'https://t4.ftcdn.net/jpg/03/83/25/83/240_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg',
      content: [
        'Hi Golden Rams!',
        'I just returned from the Student Leadership Conference hosted at West Chester, and it was truly inspiring! The sessions on strategic thinking and team dynamics have provided me with fresh insights to lead more effectively in my student organization.'
      ],
      likes: 8,
      isLiked: false,
      tags: ['Accounting', 'Student Leadership']
    }
  ]);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikeCount = post.isLiked ? post.likes - 1 : post.likes + 1;
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: newLikeCount
        };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (newPostText.trim()) {
      const newPost = {
        id: Date.now(),
        author: 'Current User',
        department: 'Your Department',
        imageUrl: 'https://t3.ftcdn.net/jpg/02/43/12/34/240_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg',
        content: [newPostText],
        likes: 0,
        isLiked: false,
        tags: []
      };
      
      setPosts([newPost, ...posts]);
      setNewPostText('');
      setIsCreatingPost(false);
    }
  };

  return (
    <div className="university-feed">
      <header className="university-header">
        <div className="university-title">
          <School className="university-icon" />
          <h1>West Chester University</h1>
        </div>
      </header>

      <div className="feed-content">
        {posts.map(post => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <img 
                src={post.imageUrl}
                alt={post.author} 
                className="profile-image" 
              />
              <div className="poster-info">
                <h2>{post.author}</h2>
                <p className="department">{post.department}</p>
              </div>
            </div>

            <div className="post-content">
              {post.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="post-footer">
              <div className="likes">
                <button 
                  className="like-button" 
                  onClick={() => handleLike(post.id)}
                >
                  <Heart 
                    className={`heart-icon ${post.isLiked ? 'filled' : ''}`}
                    size={18}
                    color="#ff4d6d"
                  />
                </button>
                <span>{post.likes}</span>
              </div>
              <div className="tags">
                {post.tags.map(tag => (
                  <span className="tag" key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="create-post">
        <img 
          src="https://t3.ftcdn.net/jpg/02/43/12/34/240_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg" 
          alt="Your profile" 
          className="profile-image" 
        />
        {isCreatingPost ? (
          <div className="post-creator">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="post-input"
              autoFocus
            />
            <div className="post-actions">
              <button 
                onClick={handleCreatePost}
                className="post-submit"
              >
                Post
              </button>
              <button 
                onClick={() => setIsCreatingPost(false)}
                className="post-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="post-button"
            onClick={() => setIsCreatingPost(true)}
          >
            Create a post
          </button>
        )}
      </div>
    </div>
  );
};

export default UniversitySocialFeed;
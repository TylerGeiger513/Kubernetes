import React from 'react';
import { School, Heart } from 'lucide-react';
import './UniversitySocialFeed.css';

const UniversitySocialFeed = () => {
  return (
    <div className="university-feed">
      <header className="university-header">
        <div className="university-title">
          <School className="university-icon" />
          <h1>West Chester University</h1>
        </div>
      </header>

      <div className="feed-content">
        <div className="post">
          <div className="post-header">
            <img 
              src="/api/placeholder/48/48" 
              alt="John Smith" 
              className="profile-image" 
            />
            <div className="poster-info">
              <h2>JOHN SMITH</h2>
              <p className="department">Computer Science</p>
            </div>
          </div>

          <div className="post-content">
            <p>Hey everyone,</p>
            <p>
              I participated in the West Chester Hackathon this weekend, and it was an electrifying
              experience! Collaborating with peers from different departments, we built a prototype for a
              campus safety app in just 24 hours. I can't wait to see how our idea evolves.
            </p>
          </div>

          <div className="post-footer">
            <div className="likes">
              <button className="like-button">
                <Heart className="heart-icon" size={18} />
              </button>
              <span>10</span>
            </div>
            <div className="tags">
              <span className="tag">#Computer Science</span>
              <span className="tag">#Hackathon</span>
            </div>
          </div>
        </div>

        <div className="post">
          <div className="post-header">
            <img 
              src="/api/placeholder/48/48" 
              alt="Olivia Brown" 
              className="profile-image" 
            />
            <div className="poster-info">
              <h2>Olivia Brown</h2>
              <p className="department">Accounting</p>
            </div>
          </div>

          <div className="post-content">
            <p>Hi Golden Rams!</p>
            <p>
              I just returned from the Student Leadership Conference hosted at West Chester, and it was
              truly inspiring! The sessions on strategic thinking and team dynamics have provided me
              with fresh insights to lead more effectively in my student organization.
            </p>
          </div>

          <div className="post-footer">
            <div className="likes">
              <button className="like-button">
                <Heart className="heart-icon" size={18} />
              </button>
              <span>8</span>
            </div>
            <div className="tags">
              <span className="tag">#Accounting</span>
              <span className="tag">#Student Leadership</span>
            </div>
          </div>
        </div>
      </div>

      <div className="create-post">
        <img 
          src="/api/placeholder/48/48" 
          alt="Your profile" 
          className="profile-image" 
        />
        <button className="post-button">Start a post</button>
      </div>
    </div>
  );
};

export default UniversitySocialFeed;
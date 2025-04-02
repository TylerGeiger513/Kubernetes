import React from 'react';
import { 
  FaUsers, 
  FaCalculator, 
  FaCode, 
  FaLeaf, 
  FaFlask, 
  FaMicroscope 
} from 'react-icons/fa';
import './UniversityGroups.css';

const UniversityGroups = () => {
  return (
    <div className="university-feed">
      <header className="university-header">
        <div className="university-title">
          <FaUsers className="university-icon" />
          <h1>Groups</h1>
        </div>
      </header>

      <div className="feed-content">
        {/* Math & Stats Association */}
        <div className="post">
          <div className="group-header">
            <div className="group-title">
              <div className="group-title-left">
                <FaCalculator className="group-icon" />
                <h2>WCU Math & Stats Association</h2>
              </div>
              <span className="member-count">
                <FaUsers size={14} /> 72
              </span>
            </div>
          </div>
          <p className="group-description">
            Offers tutoring, peer study groups, and speaker events for students in mathematics and statistics programs.
          </p>
          <button className="join-button">Join Group</button>
        </div>

        {/* Computer Science Club */}
        <div className="post">
          <div className="group-header">
            <div className="group-title">
              <div className="group-title-left">
                <FaCode className="group-icon" />
                <h2>WCU Computer Science Club</h2>
              </div>
              <span className="member-count">
                <FaUsers size={14} /> 52
              </span>
            </div>
          </div>
          <p className="group-description">
            A student-run organization focused on programming projects, hackathons, and networking with alumni in tech.
          </p>
          <button className="join-button">Join Group</button>
        </div>

        {/* Green Team */}
        <div className="post">
          <div className="group-header">
            <div className="group-title">
              <div className="group-title-left">
                <FaLeaf className="group-icon" />
                <h2>Green Team at WCU</h2>
              </div>
              <span className="member-count">
                <FaUsers size={14} /> 61
              </span>
            </div>
          </div>
          <p className="group-description">
            Environmental awareness and sustainability group advocating for clean energy, zero-waste initiatives, and campus conservation efforts.
          </p>
          <button className="join-button">Join Group</button>
        </div>

        {/* Chemistry Club */}
        <div className="post">
          <div className="group-header">
            <div className="group-title">
              <div className="group-title-left">
                <FaFlask className="group-icon" />
                <h2>Chemistry Club – ACS Student Chapter</h2>
              </div>
              <span className="member-count">
                <FaUsers size={14} /> 27
              </span>
            </div>
          </div>
          <p className="group-description">
            The official WCU chapter of the American Chemical Society. Great for students interested in chemistry careers and research.
          </p>
          <button className="join-button">Join Group</button>
        </div>

        {/* Undergraduate Research Society */}
        <div className="post">
          <div className="group-header">
            <div className="group-title">
              <div className="group-title-left">
                <FaMicroscope className="group-icon" />
                <h2>WCU Undergraduate Research Society</h2>
              </div>
              <span className="member-count">
                <FaUsers size={14} /> 27
              </span>
            </div>
          </div>
          <p className="group-description">
            Supports undergrad students conducting research across all disciplines. Hosts poster sessions and faculty-led workshops.
          </p>
          <button className="join-button">Join Group</button>
        </div>
      </div>
    </div>
  );
};

export default UniversityGroups;
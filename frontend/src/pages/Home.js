import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to Email Assistant</h1>
        <p>Your intelligent email management solution</p>
        <div className="cta-buttons">
          <Link to="/inbox" className="button primary">Check Inbox</Link>
          <Link to="/compose" className="button secondary">Compose Email</Link>
        </div>
      </section>
      
      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Smart Inbox</h3>
            <p>Organized, prioritized inbox with AI-powered sorting</p>
          </div>
          <div className="feature-card">
            <h3>Intelligent Composer</h3>
            <p>Write better emails with AI assistance</p>
          </div>
          <div className="feature-card">
            <h3>Works Offline</h3>
            <p>Continue working even without internet connection</p>
          </div>
          <div className="feature-card">
            <h3>Quick Responses</h3>
            <p>Reply faster with smart templates and suggestions</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
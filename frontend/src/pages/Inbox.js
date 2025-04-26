import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useOfflineStorage from '../hooks/useOfflineStorage';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isReady, getAllItems } = useOfflineStorage('pendingEmails');

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        // Fetch emails from offline storage
        const storedEmails = await getAllItems();
        
        // If we have stored emails, use them
        if (storedEmails && storedEmails.length > 0) {
          setEmails(storedEmails);
        } else {
          // Otherwise use demo data
          setEmails([
            {
              id: '1',
              subject: 'Welcome to Email Assistant',
              sender: 'support@emailassistant.com',
              preview: 'Thank you for using our application...',
              date: new Date(Date.now() - 3600000).toISOString(),
              read: false
            },
            {
              id: '2',
              subject: 'Your account has been created',
              sender: 'noreply@emailassistant.com',
              preview: 'Your new account is ready to use...',
              date: new Date(Date.now() - 86400000).toISOString(),
              read: true
            },
            {
              id: '3',
              subject: 'Tips for using Email Assistant',
              sender: 'tips@emailassistant.com',
              preview: 'Here are some tips to get the most out of your experience...',
              date: new Date(Date.now() - 172800000).toISOString(),
              read: false
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
        setError('Failed to load emails. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isReady) {
      fetchEmails();
    }
  }, [isReady, getAllItems]);

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date with year
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1>Inbox</h1>
        <div className="inbox-actions">
          <button className="refresh-button">Refresh</button>
          <Link to="/compose" className="compose-button">Compose</Link>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading emails...</div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <div className="email-list">
          {emails.length === 0 ? (
            <div className="empty-inbox">
              <p>Your inbox is empty</p>
            </div>
          ) : (
            emails.map(email => (
              <div key={email.id} className={`email-item ${email.read ? 'read' : 'unread'}`}>
                <div className="email-sender">{email.sender}</div>
                <div className="email-content">
                  <div className="email-subject">{email.subject}</div>
                  <div className="email-preview">{email.preview}</div>
                </div>
                <div className="email-date">{formatDate(email.date)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Inbox; 
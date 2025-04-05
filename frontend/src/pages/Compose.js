import React, { useState } from 'react';
import useOfflineStorage from '../hooks/useOfflineStorage';
import { useNavigate } from 'react-router-dom';

const Compose = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { isReady, addItem } = useOfflineStorage('pendingEmails');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle saving draft
  const handleSaveDraft = async () => {
    if (!isReady) {
      setSaveStatus({ type: 'error', message: 'Storage not ready. Please try again.' });
      return;
    }

    try {
      const draft = {
        id: `draft_${Date.now()}`,
        ...formData,
        status: 'draft',
        timestamp: Date.now()
      };

      await addItem(draft);
      setSaveStatus({ type: 'success', message: 'Draft saved successfully!' });
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save draft. Please try again.' });
    }
  };

  // Handle sending email
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isReady) {
      setSaveStatus({ type: 'error', message: 'Storage not ready. Please try again.' });
      return;
    }

    // Validate form
    if (!formData.to || !formData.subject || !formData.body) {
      setSaveStatus({ type: 'error', message: 'Please fill all required fields (To, Subject, Body).' });
      return;
    }

    setIsSending(true);
    
    try {
      const email = {
        id: `email_${Date.now()}`,
        ...formData,
        status: 'pending',
        timestamp: Date.now()
      };

      await addItem(email);
      
      // Successfully queued email for sending
      setSaveStatus({ type: 'success', message: 'Email queued for sending!' });
      
      // Clear form
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
      });
      
      // Navigate back to inbox after a delay
      setTimeout(() => {
        navigate('/inbox');
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSaveStatus({ type: 'error', message: 'Failed to send email. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="compose-page">
      <div className="compose-header">
        <h1>Compose Email</h1>
      </div>
      
      {saveStatus && (
        <div className={`status-message ${saveStatus.type}`}>
          {saveStatus.message}
        </div>
      )}
      
      <form className="compose-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="recipient@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cc">CC:</label>
          <input
            type="email"
            id="cc"
            name="cc"
            value={formData.cc}
            onChange={handleChange}
            placeholder="cc@example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bcc">BCC:</label>
          <input
            type="email"
            id="bcc"
            name="bcc"
            value={formData.bcc}
            onChange={handleChange}
            placeholder="bcc@example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email subject"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="body">Message:</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your message here..."
            rows={10}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="save-draft-button"
            onClick={handleSaveDraft}
            disabled={isSending}
          >
            Save Draft
          </button>
          <button 
            type="submit" 
            className="send-button"
            disabled={isSending || !formData.to || !formData.subject || !formData.body}
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Compose; 
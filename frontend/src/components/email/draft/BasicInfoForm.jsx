import React from 'react';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useDraftForm } from '../../../contexts/DraftFormContext';

/**
 * BasicInfoForm Component
 * 
 * Form for collecting basic information for the email draft.
 */
const BasicInfoForm = () => {
  const { formData, updateField } = useDraftForm();
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };
  
  // Handle select change
  const handleSelectChange = (field, value) => {
    updateField(field, value);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipientType">Recipient Type</Label>
          <Select 
            value={formData.recipientType} 
            onValueChange={(value) => handleSelectChange('recipientType', value)}
          >
            <SelectTrigger id="recipientType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purpose">Email Purpose</Label>
          <Select 
            value={formData.purpose} 
            onValueChange={(value) => handleSelectChange('purpose', value)}
          >
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="introduction">Introduction</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="reply">Reply</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select 
            value={formData.tone} 
            onValueChange={(value) => handleSelectChange('tone', value)}
          >
            <SelectTrigger id="tone">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="formality">Formality Level</Label>
          <Select 
            value={formData.formality} 
            onValueChange={(value) => handleSelectChange('formality', value)}
          >
            <SelectTrigger id="formality">
              <SelectValue placeholder="Select formality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="Enter email subject"
        />
      </div>
      
      {formData.purpose === 'reply' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/50">
          <h3 className="font-medium">Original Email Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="originalSender">Original Sender</Label>
            <Input
              id="originalSender"
              name="originalSender"
              value={formData.originalSender}
              onChange={handleInputChange}
              placeholder="Name of the person you're replying to"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="originalSubject">Original Subject</Label>
            <Input
              id="originalSubject"
              name="originalSubject"
              value={formData.originalSubject}
              onChange={handleInputChange}
              placeholder="Subject of the original email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="originalContent">Original Content</Label>
            <Textarea
              id="originalContent"
              name="originalContent"
              value={formData.originalContent}
              onChange={handleInputChange}
              placeholder="Content of the original email"
              rows={3}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="keyPoints">
          {formData.purpose === 'reply' ? 'Your Response Points' : 'Key Points'}
        </Label>
        <Textarea
          id="keyPoints"
          name="keyPoints"
          value={formData.keyPoints}
          onChange={handleInputChange}
          placeholder="Enter one point per line"
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Enter one point per line. These will be formatted in the email.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senderName">Your Name</Label>
          <Input
            id="senderName"
            name="senderName"
            value={formData.senderName}
            onChange={handleInputChange}
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="senderRole">Your Role/Title</Label>
          <Input
            id="senderRole"
            name="senderRole"
            value={formData.senderRole}
            onChange={handleInputChange}
            placeholder="Your job title or role"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;

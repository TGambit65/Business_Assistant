import React from 'react';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useDraftForm } from '../../../contexts/DraftFormContext';

/**
 * DetailsForm Component
 * 
 * Form for collecting additional details for the email draft.
 */
const DetailsForm = () => {
  const { formData, updateField } = useDraftForm();
  
  // Handle switch change
  const handleSwitchChange = (field, checked) => {
    updateField(field, checked);
  };
  
  // Handle select change
  const handleSelectChange = (field, value) => {
    updateField(field, value);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Advanced Options</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => handleSelectChange('industry', value)}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adds industry-specific terminology to your email
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select 
              value={formData.documentType} 
              onValueChange={(value) => handleSelectChange('documentType', value)}
            >
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Standard Email</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="statusUpdate">Status Update</SelectItem>
                <SelectItem value="meetingRequest">Meeting Request</SelectItem>
                <SelectItem value="followUp">Follow-up</SelectItem>
                <SelectItem value="introduction">Introduction</SelectItem>
                <SelectItem value="businessProposal">Business Proposal</SelectItem>
                <SelectItem value="progressReport">Progress Report</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Structures your email for a specific purpose
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select 
              value={formData.audience} 
              onValueChange={(value) => handleSelectChange('audience', value)}
            >
              <SelectTrigger id="audience">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal (Colleagues)</SelectItem>
                <SelectItem value="external">External (Clients)</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adjusts language for your specific audience
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Options</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="includeData">Include Data Points</Label>
            <p className="text-sm text-muted-foreground">
              Add placeholders for data or statistics
            </p>
          </div>
          <Switch
            id="includeData"
            checked={formData.includeData}
            onCheckedChange={(checked) => handleSwitchChange('includeData', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="includeCTA">Include Call to Action</Label>
            <p className="text-sm text-muted-foreground">
              Add a clear next step or request
            </p>
          </div>
          <Switch
            id="includeCTA"
            checked={formData.includeCTA}
            onCheckedChange={(checked) => handleSwitchChange('includeCTA', checked)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Structure</h3>
        
        <div className="p-4 border rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Greeting</span>
            <span className="text-muted-foreground">✓ Included</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Introduction</span>
            <span className="text-muted-foreground">✓ Included</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Main Content</span>
            <span className="text-muted-foreground">✓ Included</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Call to Action</span>
            <span className="text-muted-foreground">
              {formData.includeCTA ? '✓ Included' : '✗ Not Included'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Closing</span>
            <span className="text-muted-foreground">✓ Included</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Signature</span>
            <span className="text-muted-foreground">✓ Included</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;

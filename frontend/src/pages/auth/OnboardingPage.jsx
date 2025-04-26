import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useEnhancedAuth } from '../../auth';
import { useToast } from '../../contexts/ToastContext';
import { Check, User, Briefcase, Mail } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUserPreferences } = useEnhancedAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user preferences with the onboarding information
      await updateUserPreferences({
        defaultEmailSignature: signature || `Best regards,\n${fullName}`,
        defaultReplySignature: `Regards,\n${fullName}`,
        showNotifications: receiveNotifications,
        companyName: companyName,
        jobTitle: jobTitle
      });

      success('Profile setup completed successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      error('An error occurred while saving your preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src="/logo192.png" alt="Business Assistant Logo" className="mx-auto h-16 w-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Business Assistant</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Let's set up your profile to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              Customize your experience with a few simple steps
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <Briefcase className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Company Name
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  <Briefcase className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Job Title
                </Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="Marketing Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">
                  <Mail className="inline-block h-4 w-4 mr-1 align-text-bottom" /> Email Signature
                </Label>
                <textarea
                  id="signature"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder={`Best regards,\n${fullName}`}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                ></textarea>
                <p className="text-xs text-muted-foreground">
                  This will be appended to your emails. Leave blank to use default.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notifications" 
                  checked={receiveNotifications}
                  onCheckedChange={setReceiveNotifications}
                />
                <Label htmlFor="notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Receive email notifications
                </Label>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> Complete Setup
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          You can always update these settings later in your profile
        </p>
      </div>
    </div>
  );
} 
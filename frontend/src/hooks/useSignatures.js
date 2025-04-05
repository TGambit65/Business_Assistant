// import React from 'react'; // useState and useEffect are not used directly
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from './useLocalStorage';

export function useSignatures() {
  const { success, error } = useToast();
  const [signatures, setSignatures] = useLocalStorage('email-signatures', [
    {
      id: '1',
      name: 'Professional',
      content: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <p style="margin-bottom: 10px;"><strong>John Doe</strong><br>
        Business Professional<br>
        Acme Corporation</p>
        
        <p style="margin-bottom: 10px;">
        <span style="color: #666666;">Email:</span> john.doe@example.com<br>
        <span style="color: #666666;">Phone:</span> (555) 123-4567<br>
        <span style="color: #666666;">Website:</span> <a href="https://www.example.com" style="color: #1a73e8; text-decoration: none;">www.example.com</a>
        </p>
        
        <p style="font-size: 12px; color: #777777; border-top: 1px solid #dddddd; padding-top: 10px; margin-top: 10px;">
          This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
        </p>
      </div>`,
      default: true
    },
    {
      id: '2',
      name: 'Simple',
      content: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <p>
        John Doe<br>
        john.doe@example.com
        </p>
      </div>`,
      default: false
    },
    {
      id: '3',
      name: 'Modern',
      content: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="20" style="background-color: #1a73e8;"></td>
            <td width="20"></td>
            <td>
              <p style="margin-bottom: 10px; font-size: 16px;"><strong>John Doe</strong></p>
              <p style="margin-bottom: 15px; color: #666666;">Business Professional | Acme Corporation</p>
              
              <p style="margin-bottom: 10px;">
                <a href="mailto:john.doe@example.com" style="color: #1a73e8; text-decoration: none;">john.doe@example.com</a><br>
                <span style="color: #666666;">(555) 123-4567</span>
              </p>
            </td>
          </tr>
        </table>
      </div>`,
      default: false
    }
  ]);
  
  const defaultSignature = signatures.find(sig => sig.default) || signatures[0];
  
  const addSignature = (newSignature) => {
    try {
      if (!newSignature.name || !newSignature.content) {
        throw new Error('Signature name and content are required');
      }
      
      const id = Date.now().toString();
      let updatedSignatures = [...signatures, { ...newSignature, id }];
      
      // If this is the first signature or explicitly set as default
      if (signatures.length === 0 || newSignature.default) {
        // Ensure only one default signature
        updatedSignatures = updatedSignatures.map(sig => ({
          ...sig,
          default: sig.id === id
        }));
      }
      
      setSignatures(updatedSignatures);
      success('Signature added successfully');
      
      return id;
    } catch (err) {
      error(err.message || 'Failed to add signature');
      return null;
    }
  };
  
  const updateSignature = (id, updatedData) => {
    try {
      const sigIndex = signatures.findIndex(sig => sig.id === id);
      if (sigIndex === -1) {
        throw new Error('Signature not found');
      }
      
      let updatedSignatures = [...signatures];
      updatedSignatures[sigIndex] = {
        ...updatedSignatures[sigIndex],
        ...updatedData
      };
      
      // If setting this one as default, update all others
      if (updatedData.default) {
        updatedSignatures = updatedSignatures.map(sig => ({
          ...sig,
          default: sig.id === id
        }));
      }
      
      setSignatures(updatedSignatures);
      success('Signature updated successfully');
      
      return true;
    } catch (err) {
      error(err.message || 'Failed to update signature');
      return false;
    }
  };
  
  const deleteSignature = (id) => {
    try {
      const sigIndex = signatures.findIndex(sig => sig.id === id);
      if (sigIndex === -1) {
        throw new Error('Signature not found');
      }
      
      const wasDefault = signatures[sigIndex].default;
      const updatedSignatures = signatures.filter(sig => sig.id !== id);
      
      // If we deleted the default signature and have others remaining,
      // make the first one the new default
      if (wasDefault && updatedSignatures.length > 0) {
        updatedSignatures[0].default = true;
      }
      
      setSignatures(updatedSignatures);
      success('Signature deleted successfully');
      
      return true;
    } catch (err) {
      error(err.message || 'Failed to delete signature');
      return false;
    }
  };
  
  const setDefaultSignature = (id) => {
    try {
      const exists = signatures.some(sig => sig.id === id);
      if (!exists) {
        throw new Error('Signature not found');
      }
      
      const updatedSignatures = signatures.map(sig => ({
        ...sig,
        default: sig.id === id
      }));
      
      setSignatures(updatedSignatures);
      success('Default signature has been updated');
      
      return true;
    } catch (err) {
      error(err.message || 'Failed to set default signature');
      return false;
    }
  };
  
  return {
    signatures,
    defaultSignature,
    addSignature,
    updateSignature,
    deleteSignature,
    setDefaultSignature
  };
} 
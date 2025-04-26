import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Info, Upload, Trash2, Eye } from 'lucide-react';
import ContextDocumentService from '../../services/ContextDocumentService';
import DeepseekChatService from '../../services/DeepseekChatService';

/**
 * ContextDocumentManager - Component for managing context documents used by AI chat
 */
const ContextDocumentManager = () => {
  // State for user documents
  const [userDocuments, setUserDocuments] = useState([]);
  
  // State for system documents
  const [systemDocuments, setSystemDocuments] = useState([]);
  
  // State for file upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  // State for document preview dialog
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  
  // State for tracking whether context documents are enabled
  const [useContextDocuments, setUseContextDocuments] = useState(true);
  
  // State for file upload
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
    
    // Get current setting from DeepseekChatService
    setUseContextDocuments(DeepseekChatService.useContextDocuments);
  }, []);
  
  // Load documents from the service
  const loadDocuments = () => {
    setUserDocuments(ContextDocumentService.getUserDocuments());
    setSystemDocuments(ContextDocumentService.getSystemDocuments());
  };
  
  // Handle document toggle (active/inactive)
  const handleToggleDocument = (id) => {
    const newActive = ContextDocumentService.toggleUserDocumentActive(id);
    
    // Update local state
    setUserDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === id ? { ...doc, active: newActive } : doc
      )
    );
  };
  
  // Handle document deletion
  const handleDeleteDocument = (document) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm document deletion
  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      ContextDocumentService.deleteUserDocument(documentToDelete.id);
      
      // Update local state
      setUserDocuments(prevDocs => 
        prevDocs.filter(doc => doc.id !== documentToDelete.id)
      );
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };
  
  // Preview document content
  const handlePreviewDocument = (document) => {
    setPreviewDocument(document);
    setIsPreviewDialogOpen(true);
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        const documentData = await ContextDocumentService.parseUploadedDocument(selectedFile);
        
        // Add the document
        const id = ContextDocumentService.addUserDocument(
          uploadFileName || documentData.name,
          documentData.content,
          true // Active by default
        );
        
        // Reload documents
        loadDocuments();
        
        // Reset upload state
        setSelectedFile(null);
        setUploadFileName('');
        setIsUploadDialogOpen(false);
      } catch (error) {
        console.error('Error uploading document:', error);
        // TODO: Show error message to user
      }
    }
  };
  
  // Toggle context documents on/off
  const handleToggleContextDocuments = (event) => {
    const newValue = event;
    setUseContextDocuments(newValue);
    DeepseekChatService.setUseContextDocuments(newValue);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Context Documents</CardTitle>
          <CardDescription>
            Manage documents that provide context to the AI chat assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Context documents help the AI assistant provide more accurate and relevant responses
              by giving it access to specific information about your application and requirements.
            </p>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={useContextDocuments}
                onCheckedChange={handleToggleContextDocuments}
                id="context-toggle"
              />
              <label htmlFor="context-toggle" className="text-sm">
                {useContextDocuments ? 'Context documents enabled' : 'Context documents disabled'}
              </label>
            </div>
          </div>
          
          <div className="border-t pt-6 mb-6"></div>
          
          {/* System Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">System Documents</h3>
            
            {systemDocuments.length === 0 ? (
              <p className="text-sm text-gray-500">No system documents available</p>
            ) : (
              <ul className="space-y-2">
                {systemDocuments.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-800 rounded-md">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">System document, always active</p>
                    </div>
                    <button 
                      onClick={() => handlePreviewDocument(doc)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                    >
                      <Eye size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="border-t pt-6 mb-6"></div>
          
          {/* User Documents */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">User Documents</h3>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload size={16} className="mr-2" />
                Upload Document
              </Button>
            </div>
            
            {userDocuments.length === 0 ? (
              <div className="p-4 bg-muted dark:bg-gray-800 rounded-md">
                <p className="text-sm text-gray-500">
                  You haven't added any custom context documents yet. 
                  Upload documents to give the AI assistant more context 
                  about your specific requirements or information.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {userDocuments.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between p-3 bg-muted dark:bg-gray-800 rounded-md">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Added: {new Date(doc.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={doc.active}
                        onCheckedChange={() => handleToggleDocument(doc.id)}
                        size="sm"
                      />
                      <button 
                        onClick={() => handlePreviewDocument(doc)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Context Document</DialogTitle>
            <DialogDescription>
              Upload a document to provide context for the AI assistant.
              Supported formats: PDF, TXT, MD, DOCX
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="document-name" className="text-sm font-medium">
                Document Name
              </label>
              <input
                type="text"
                id="document-name"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
                placeholder="Enter document name"
              />
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="document-file" className="text-sm font-medium">
                Document File
              </label>
              <input
                type="file"
                id="document-file"
                onChange={handleFileSelect}
                className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none dark:border-gray-700"
                accept=".pdf,.txt,.md,.docx"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {documentToDelete && (
            <p className="py-4 font-medium">
              "{documentToDelete.name}"
            </p>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDocument}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.name || 'Document Preview'}
            </DialogTitle>
            <DialogDescription>
              Content of the document that will be used for AI context
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 max-h-[50vh] overflow-y-auto p-4 rounded-md bg-muted dark:bg-gray-900 text-sm">
            {previewDocument?.content ? (
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {previewDocument.content}
              </pre>
            ) : (
              <p className="text-gray-500">No content available</p>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContextDocumentManager; 
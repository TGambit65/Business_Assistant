import React, { useState } from "react";
import {
  Settings,
  Mail,
  Star,
  AlertCircle,
  Bell,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

import SettingsPage from "./SettingsPage";

/* -------------------------------------------------------------------------- */
/*                                HELPER COMPONENTS                           */
/* -------------------------------------------------------------------------- */

/**
 * Placeholder Button component
 */
const Button = ({ variant, size, className, onClick, children }) => (
  <button
    className={`rounded-md transition-all duration-200 ${
      variant === "ghost"
        ? "bg-transparent hover:bg-transparent dark:hover:bg-dark-card-bg"
        : "bg-light-unread-bg dark:bg-dark-card-bg hover:bg-light-unread-text dark:hover:bg-[#4A3E3A]"
    } ${size === "icon" ? "p-2" : "px-4 py-2"} ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

/**
 * Placeholder ScrollArea component
 */
const ScrollArea = ({ className, children }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

/* -------------------------------------------------------------------------- */
/*                               EMAIL EDIT MODAL                              */
/* -------------------------------------------------------------------------- */

function EmailEditModal({ isOpen, onClose, email }) {
  /**
   * If this email is opened via "Draft," we show `email.draft`.
   * If opened via "Edit," we show `email.fullSummary`.
   */
  const initialContent = email?.draft || email?.fullSummary || "";
  const [content, setContent] = useState(initialContent);
  
  // When the email changes, update the content
  React.useEffect(() => {
    setContent(email?.draft || email?.fullSummary || "");
  }, [email]);

  const handleEditorChange = (content) => {
    setContent(content);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", content);
    onClose();
  };

  const handleSend = () => {
    console.log("Sending email:", content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {email?.draft ? "Edit Draft" : "Edit Email"}
        </h2>

        <div className="mb-4">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center">
              <span className="w-16 text-gray-600 dark:text-gray-400">To:</span>
              <input
                type="text"
                className="flex-grow p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                defaultValue={email?.to || ""}
              />
            </div>
            <div className="flex items-center">
              <span className="w-16 text-gray-600 dark:text-gray-400">
                Subject:
              </span>
              <input
                type="text"
                className="flex-grow p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                defaultValue={email?.subject || ""}
              />
            </div>
          </div>

          <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
            <RichTextEditor
              initialContent={content}
              onChange={handleEditorChange}
              darkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN DASHBOARD                                */
/* -------------------------------------------------------------------------- */

export default function MainDashboard() {
  // Whether the SettingsPage is open
  const [showSettings, setShowSettings] = useState(false);

  // Current selected category
  const [selectedBox, setSelectedBox] = useState("all");

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // Whether the TinyMCE Email Edit Modal is open
  const [editingEmail, setEditingEmail] = useState(null);
  
  // Whether the mobile sidebar is open
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Default categories/boxes
  const [boxes, setBoxes] = useState([
    {
      id: "all",
      name: "All",
      unread: 4,
      color: "#000000",
      icon: Mail,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "work",
      name: "Work",
      unread: 5,
      color: "#4285F4",
      icon: Star,
      important: true,
      instructions: "",
      keywords: "",
    },
    {
      id: "personal",
      name: "Personal",
      unread: 2,
      color: "#34A853",
      icon: Mail,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "urgent",
      name: "Urgent",
      unread: 1,
      color: "#EA4335",
      icon: AlertCircle,
      important: true,
      instructions: "",
      keywords: "",
    },
    {
      id: "social",
      name: "Social",
      unread: 3,
      color: "#FBBC05",
      icon: Bell,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "promotions",
      name: "Promotions",
      unread: 8,
      color: "#8E44AD",
      icon: Star,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "updates",
      name: "Updates",
      unread: 0,
      color: "#3498DB",
      icon: Bell,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "forums",
      name: "Forums",
      unread: 4,
      color: "#E67E22",
      icon: Mail,
      important: false,
      instructions: "",
      keywords: "",
    },
    {
      id: "newsletters",
      name: "Newsletters",
      unread: 12,
      color: "#1ABC9C",
      icon: Mail,
      important: false,
      instructions: "",
      keywords: "",
    },
  ]);

  // Sample email data
  const sampleEmails = [
    {
      id: 1,
      subject: "Project Meeting Tomorrow",
      dateTimeReceived: "2025-03-10 09:30 AM",
      sender: "boss@work.com",
      cc: "",
      bcc: "",
      quickSummary: "Discuss project timeline.",
      fullSummary:
        "We need to discuss the project timeline, upcoming deadlines, and resource allocation for the next quarter.",
      draft: "AI Draft (Sonnet 3.7) for Project Meeting: Lorem ipsum AI content...",
      category: "work",
      starred: true,
    },
    {
      id: 2,
      subject: "Dinner Plans for Tonight",
      dateTimeReceived: "2025-03-09 06:15 PM",
      sender: "friend@gmail.com",
      cc: "",
      bcc: "",
      quickSummary: "Pizza dinner?",
      fullSummary:
        "Are we still on for dinner tonight? I'm thinking of ordering pizza from our favorite place.",
      draft: "AI Draft (Sonnet 3.7) for Dinner Plans: Lorem ipsum AI content...",
      category: "personal",
      starred: false,
    },
    {
      id: 3,
      subject: "Urgent: Server Downtime",
      dateTimeReceived: "2025-03-10 07:45 AM",
      sender: "it-support@work.com",
      cc: "manager@work.com",
      bcc: "",
      quickSummary: "Immediate server issue.",
      fullSummary:
        "The main server is down, causing service disruptions. Immediate action is required to diagnose and resolve the issue.",
      draft: "AI Draft (Sonnet 3.7) for Urgent Server Downtime: Lorem ipsum AI content...",
      category: "urgent",
      starred: true,
    },
    {
      id: 4,
      subject: "Weekend Social Gathering",
      dateTimeReceived: "2025-03-09 05:00 PM",
      sender: "club@social.com",
      cc: "",
      bcc: "",
      quickSummary: "Get together this weekend.",
      fullSummary:
        "Join us for a weekend social gathering at the downtown club. Expect great food, music, and company.",
      draft: "AI Draft (Sonnet 3.7) for Social Gathering: Lorem ipsum AI content...",
      category: "social",
      starred: false,
    },
  ];

  // Filter emails based on selected category
  const filteredEmails =
    selectedBox === "all"
      ? sampleEmails
      : sampleEmails.filter(
          (email) => email.category === selectedBox.toLowerCase()
        );

  // Toggle "important" star for a box
  const toggleImportant = (boxId) => {
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === boxId ? { ...b, important: !b.important } : b
      )
    );
  };

  // Delete a box (from settings)
  const handleDeleteBox = (boxId) => {
    setBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (selectedBox === boxId) {
      setSelectedBox("all");
    }
  };

  // Rename a box (from settings)
  const handleRenameBox = (boxId, newName, newInstructions, newKeywords) => {
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === boxId
          ? {
              ...b,
              name: newName,
              instructions: newInstructions,
              keywords: newKeywords,
            }
          : b
      )
    );
  };

  // Add a new box (from settings)
  const handleAddBox = () => {
    const newId = Date.now().toString();
    const newBox = {
      id: newId,
      name: "New Box",
      unread: 0,
      color: "#000000",
      icon: Mail,
      important: false,
      instructions: "",
      keywords: "",
    };
    setBoxes([...boxes, newBox]);
    return newBox;
  };
  
  // Close mobile sidebar when a category is selected
  const handleCategorySelect = (boxId) => {
    setSelectedBox(boxId);
    setShowMobileSidebar(false);
  };

  return (
    <div className={`${darkMode ? "dark" : ""} flex flex-col md:flex-row h-screen bg-light-bg dark:bg-dark-bg`}>
      {/* ---------------------------------------------------------------------- */}
      {/*                         MOBILE HEADER (VISIBLE ON MOBILE ONLY)         */}
      {/* ---------------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between p-3 bg-light-sidebar-bg dark:bg-dark-sidebar-bg border-b border-light-unread-bg dark:border-dark-border">
        <button 
          className="p-2 text-black dark:text-white touch-manipulation"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-black dark:text-dark-text">
          {selectedBox === "all" ? "Inbox" : boxes.find((b) => b.id === selectedBox)?.name}
        </h1>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="border border-white dark:border-orange-500"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5 text-black dark:text-dark-text" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/*                         MAIN INBOX CONTAINER                          */}
      {/* ---------------------------------------------------------------------- */}
      <div
        className="
          flex-1 overflow-auto order-2 md:order-1
          bg-gradient-to-br from-white to-blue-50 border-2 border-blue-500
          dark:bg-gradient-to-br dark:from-[#4A3E36] dark:to-[#5A4A40] dark:border-dark-border
          rounded-none md:rounded-lg m-0 md:m-2 shadow-xl dark:shadow-none
          transition-all duration-300
        "
      >
        {/* INBOX HEADER - DESKTOP ONLY */}
        <div
          className="
            hidden md:block w-full
            bg-light-sidebar-bg dark:bg-dark-sidebar-bg
            border-b border-light-unread-bg dark:border-dark-border
            p-4
          "
        >
          <h1 className="text-3xl font-bold text-black dark:text-dark-text text-center">
            {selectedBox === "all"
              ? "Inbox"
              : boxes.find((b) => b.id === selectedBox)?.name}
          </h1>
        </div>

        {/* EMAIL CONTENT AREA */}
        <div
          className="
            p-3 md:p-6
            bg-transparent dark:bg-dark-sidebar-bg
            transition-colors
          "
        >
          {filteredEmails.length === 0 ? (
            <p className="italic text-black dark:text-dark-text">
              No emails in this category.
            </p>
          ) : (
            filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                setEditingEmail={setEditingEmail}
              />
            ))
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/*                      MOBILE SIDEBAR OVERLAY                           */}
      {/* ---------------------------------------------------------------------- */}
      {showMobileSidebar && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* ---------------------------------------------------------------------- */}
      {/*                                SIDEBAR                                 */}
      {/* ---------------------------------------------------------------------- */}
      <div
        className={`
          fixed md:static top-0 bottom-0 left-0 z-50
          flex flex-col
          w-[280px] md:w-[300px] bg-light-sidebar-bg dark:bg-dark-sidebar-bg
          border-r border-light-unread-bg dark:border-dark-border
          shadow-lg rounded-none md:rounded-lg m-0 md:m-2
          transform transition-transform duration-300 ease-in-out
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:order-2
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-light-unread-bg dark:border-dark-border">
          <h2 className="text-xl font-semibold text-black dark:text-dark-text">
            Business Assistant
          </h2>
          <div className="flex items-center space-x-2">
            {/* Close button on mobile */}
            <button 
              className="md:hidden p-2 text-black dark:text-white"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            
            <span className="text-sm hidden md:inline text-black dark:text-dark-text">
              {darkMode ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                border border-white dark:border-orange-500 hover:scale-105
                ${darkMode ? "bg-dark-border" : "bg-light-unread-bg"}
              `}
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform
                  ${darkMode ? "translate-x-5" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        </div>

        {/* SIDEBAR BOXES */}
        <ScrollArea className="flex-1 px-2 py-3">
          <div className="space-y-2">
            {boxes.map((box) => (
              <CategoryBox
                key={box.id}
                box={box}
                onClick={() => handleCategorySelect(box.id)}
                isSelected={selectedBox === box.id}
                toggleImportant={toggleImportant}
              />
            ))}
          </div>
        </ScrollArea>

        {/* SIDEBAR FOOTER */}
        <div className="p-4 border-t border-light-unread-bg dark:border-dark-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="border border-white dark:border-orange-500 hover:scale-105"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-6 w-6 text-black dark:text-dark-text" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/*                            SETTINGS PAGE MODAL                          */}
      {/* ---------------------------------------------------------------------- */}
      {showSettings && (
        <SettingsPage
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          boxes={boxes}
          setBoxes={setBoxes}
          toggleImportant={toggleImportant}
          handleDeleteBox={handleDeleteBox}
          handleRenameBox={handleRenameBox}
          handleAddBox={handleAddBox}
        />
      )}

      {/* ---------------------------------------------------------------------- */}
      {/*                          EMAIL EDIT MODAL (TINY)                        */}
      {/* ---------------------------------------------------------------------- */}
      {editingEmail && (
        <EmailEditModal
          isOpen={!!editingEmail}
          onClose={() => setEditingEmail(null)}
          email={editingEmail}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          EMAIL CARD COMPONENT                              */
/* -------------------------------------------------------------------------- */

function EmailCard({ email, setEditingEmail }) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <div
      className="
        relative bg-light-card-bg dark:bg-dark-card-bg
        border-[2px] md:border-[3px] border-blue-500 dark:border-dark-border
        rounded-lg shadow-sm p-3 md:p-4 mb-3 md:mb-4 hover:shadow-md
        transition-all duration-200 transform hover:-translate-y-1
      "
    >
      <div className="mb-2">
        <p className="text-lg md:text-xl font-semibold text-black dark:text-dark-preview-text">
          {email.subject}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {email.dateTimeReceived}
        </p>
      </div>
      <div className="mb-2">
        <p className="text-sm text-black dark:text-dark-text">
          From: {email.sender}
          {email.cc && <span className="ml-2">CC: {email.cc}</span>}
          {email.bcc && <span className="ml-2">BCC: {email.bcc}</span>}
        </p>
      </div>
      <div className="mb-3 md:mb-4">
        <p className="text-sm text-black dark:text-dark-text">
          {showFullSummary ? email.fullSummary : email.quickSummary}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap justify-center gap-2 mt-3 md:mt-4">
        <button
          className="px-3 py-2 rounded-md font-medium text-white transition-colors bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[70px] touch-manipulation"
          onClick={() => alert("Mark as read logic goes here.")}
        >
          Read
        </button>
        <button
          className="px-3 py-2 rounded-md font-medium text-white transition-colors bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[70px] touch-manipulation"
          onClick={() => setEditingEmail({ ...email, mode: "edit" })}
        >
          Edit
        </button>
        <button
          className="px-3 py-2 rounded-md font-medium text-white transition-colors bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[70px] touch-manipulation"
          onClick={() => setShowFullSummary(!showFullSummary)}
        >
          {showFullSummary ? "Less" : "More"}
        </button>
        <button
          className="px-3 py-2 rounded-md font-medium text-white transition-colors bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[70px] touch-manipulation"
          onClick={() => setEditingEmail({ ...email, mode: "draft" })}
        >
          Draft
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         CATEGORY BOX COMPONENT                             */
/* -------------------------------------------------------------------------- */

function CategoryBox({ box, onClick, isSelected, toggleImportant }) {
  const Icon = box.icon || Mail;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-3 rounded-lg cursor-pointer
        transition-all duration-200
        border border-white dark:border-orange-500
        ${
          isSelected
            ? "bg-light-card-bg dark:bg-dark-card-bg shadow-md"
            : "hover:bg-light-unread-bg dark:hover:bg-dark-card-bg"
        }
      `}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full mr-3"
        style={{ backgroundColor: box.color + "33" }}
      >
        {Icon && <Icon className="h-4 w-4 text-black dark:text-white" />}
      </div>
      <span className="text-sm font-medium text-black dark:text-dark-text">
        {box.name}
      </span>
      <div className="ml-auto mr-2 text-sm font-medium text-black dark:text-dark-text">
        {box.unread || 0}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleImportant(box.id);
        }}
        className="ml-1 p-1 touch-manipulation"
        title="Toggle Important"
      >
        {box.important ? (
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <Star className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

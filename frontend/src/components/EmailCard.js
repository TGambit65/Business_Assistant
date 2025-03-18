import React, { useState } from "react";

export default function EmailCard({
  email,
  darkMode,
  onToggleRead,
  onRequestEdit,
  onRequestSummary,
  onSaveDraft,
}) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Creating CSS class strings based on dark mode and email status
  const cardClass = `
    flex flex-col p-3 rounded-lg shadow-sm 
    mb-3 transition-all duration-200 ease-in-out
    cursor-pointer relative overflow-hidden
    hover:shadow-md hover:-translate-y-1 
    touch-manipulation border
    ${
      email.isRead
        ? `bg-gray-50 dark:bg-gray-800 
           border-gray-300 dark:border-gray-700`
        : `bg-white dark:bg-[#3A3A3A] font-medium 
           border-blue-200 dark:border-orange-800 
           shadow-blue-100 dark:shadow-orange-900/30`
    }
  `;

  const categoryStyles = {
    work: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    personal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    finances: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    shopping: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    travel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  const getDateString = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleEmailClick = () => {
    if (!email.isRead) {
      onToggleRead(email.id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onRequestEdit(email);
  };

  const handleSummaryClick = (e) => {
    e.stopPropagation();
    setShowFullSummary(!showFullSummary);
    if (!showFullSummary && !email.summary) {
      onRequestSummary(email.id);
    }
  };

  return (
    <div className={cardClass} onClick={handleEmailClick}>
      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
        <div className="flex items-center space-x-2">
          {/* Email status indicator */}
          {!email.isRead && (
            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-orange-500"></div>
          )}
          
          {/* Subject line with improved mobile handling */}
          <h3 className="text-gray-900 dark:text-gray-100 font-medium text-base md:text-lg truncate max-w-[250px] md:max-w-md">
            {email.subject || "(No subject)"}
          </h3>
        </div>
        
        {/* Date with better format on mobile */}
        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {getDateString(email.dateReceived)}
        </div>
      </div>
      
      {/* Sender info and category tag */}
      <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          From: <span className="font-medium">{email.sender}</span>
        </div>
        
        {email.category && (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              categoryStyles[email.category] || categoryStyles.other
            }`}
          >
            {email.category}
          </span>
        )}
      </div>
      
      {/* Content section */}
      <div className="mt-1">
        {/* Quick summary */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 md:line-clamp-3">
          {email.content?.substring(0, 150)}...
        </p>
        
        {/* AI Summary section if available */}
        {email.summary && (
          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                AI SUMMARY:
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {showFullSummary ? email.summary : email.summary.split(" ").slice(0, 20).join(" ") + "..."}
            </p>
          </div>
        )}
      </div>
      
      {/* Action buttons with better touch targets */}
      <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        {!email.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(email.id);
            }}
            className="px-3 py-2 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400 touch-manipulation"
          >
            Mark as Read
          </button>
        )}
        
        <button
          onClick={handleEditClick}
          className="px-3 py-2 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 touch-manipulation"
        >
          {email.isDraft ? "Edit Draft" : "Edit & Reply"}
        </button>
        
        {email.summary || email.content ? (
          <button
            onClick={handleSummaryClick}
            className="px-3 py-2 text-xs rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-400 touch-manipulation"
          >
            {email.summary
              ? showFullSummary
                ? "Show Less"
                : "Show Full Summary"
              : "Generate Summary"}
          </button>
        ) : null}
        
        {email.isDraft && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveDraft(email);
            }}
            className="px-3 py-2 text-xs rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 touch-manipulation"
          >
            Save Draft
          </button>
        )}
      </div>
    </div>
  );
} 
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-primary">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 
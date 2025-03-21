# Business Assistant

A modern, responsive business assistant application built with React and Tailwind CSS. This app helps users manage their emails, create business documents, and organize their work more efficiently with AI-powered features.

## Features

- **AI-Powered Drafting**: Generate professional emails and business documents tailored to your needs
- **Smart Templates**: Access a library of customizable templates for various communication purposes
- **Advanced Organization**: Categorize and prioritize your emails with intelligent filters
- **Document Generation**: Create business documents, proposals, and more with customized industry-specific templates
- **Rich Text Editing**: Format your content with a powerful built-in editor
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Multiple Languages**: Support for multilingual communication
- **Mobile Responsive**: Access your business assistant from any device

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`

## Usage

Sign in with your account credentials to access the full functionality of the Business Assistant.

### Email Management

- View and organize your inbox
- Sort emails by priority, category, or date
- Apply labels for better organization

### AI Features

- Generate email drafts with the AI assistant
- Get content suggestions while composing
- Create industry-specific business documents

### Settings

- Customize your experience through the settings page
- Set up email signatures
- Configure notification preferences

## Technology Stack

- **Frontend**: React, Tailwind CSS, React Router
- **State Management**: React Context API
- **Charts**: Recharts for visualizations
- **Authentication**: JWT-based authentication
- **Styling**: Custom UI components built with Tailwind

## Project Structure

```
email-assistant/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Layout components
│   │   │   └── ui/           # UI components (buttons, cards, etc.)
│   │   ├── contexts/         # React Context providers
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   └── settings/     # Settings pages
│   │   ├── lib/              # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   └── index.js          # Application entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
└── README.md                 # Project documentation
```

## Roadmap

- Email scheduling functionality
- AI-powered email response suggestions
- Integration with popular email services
- Mobile app versions for iOS and Android

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The project uses [React](https://reactjs.org/) for the frontend UI
- Styling is done with [Tailwind CSS](https://tailwindcss.com/)
- Icons provided by [Lucide](https://lucide.dev/)
- Charts built with [Recharts](https://recharts.org/) 
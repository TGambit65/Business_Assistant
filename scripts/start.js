#!/usr/bin/env node

/**
 * Smart start script for the Email Assistant project
 * This script detects whether to start the frontend dev server or backend server
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Check if we're in development or production mode
const isProduction = process.env.NODE_ENV === 'production';
const backendExists = fs.existsSync(path.join(__dirname, '../dist/index.js'));

if (isProduction && backendExists) {
  console.log('Starting backend server in production mode...');
  // Start the backend server
  runScript('npm', ['run', 'start:backend']);
} else {
  console.log('Starting frontend development server...');
  // Start the frontend dev server
  runScript('npm', ['run', 'start:frontend']);
}

/**
 * Run a script with proper output piping
 */
function runScript(command, args) {
  const isWindows = os.platform() === 'win32';
  const cmd = isWindows ? command + '.cmd' : command;
  
  const child = spawn(cmd, args, { 
    stdio: 'inherit',
    shell: isWindows
  });
  
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}`);
    }
  });
  
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
} 
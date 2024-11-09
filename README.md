# Installation and Setup Guide

This guide will help you set up and run the project, even if you're new to programming.

## Prerequisites

### 1. Install Node.js
Node.js is a runtime environment that allows you to run JavaScript code on your computer.

1. Visit the [official Node.js website](https://nodejs.org/)
2. Download the "LTS" (Long Term Support) version for your operating system (Windows, Mac, or Linux)
3. Run the installer and follow the installation wizard
4. To verify installation, open your terminal/command prompt and type:
   ```
   node --version
   ```
   You should see a version number like `v22.x.x`

### 2. Install PNPM
PNPM is a fast and efficient package manager for JavaScript projects.

1. Open your terminal/command prompt
2. Run the following command:
   ```
   npm install -g pnpm
   ```
   (npm comes pre-installed with Node.js)
3. To verify installation, type:
   ```
   pnpm --version
   ```
   You should see a version number like `9.x.x`

## Project Setup

### 3. Install Project Dependencies
1. Open your terminal/command prompt
2. Navigate to your project folder (use the `cd` command, for example: `cd kedai`)
3. Run:
   ```
   pnpm i
   ```
   This will install all necessary packages for the project. It might take a few minutes.

### 4. Configure Environment Variables
Environment variables are used to store sensitive configuration settings.

1. Look for a file named `.env.example` in your project folder
2. Create a new file named `.env` in the same location
3. Copy all contents from `.env.example` to `.env`
4. Replace the placeholder values in `.env` with your actual configuration values

### 5. Start the Development Server
1. In your terminal/command prompt (still in the project folder), run:
   ```
   pnpm dev
   ```
2. Wait for the server to start - you'll see some messages in the terminal indicating that everything is running

## Accessing the Application

Once everything is running, you can access different parts of the application:

1. **Web Management Page**
   - Open your web browser
   - Go to `http://localhost:3000`
   - You should see the main application interface

2. **Database Browser**
   - Open your web browser
   - Go to `http://local.drizzle.studio`
   - Here you can browse and manage the database

3. **Mobile App**
   - The mobile app can be accessed through Expo Metro
   - Follow the instructions shown in your terminal after running `pnpm dev`
   - You'll typically need to:
     - Install the Expo Go app on your mobile device
     - Scan the QR code shown in the terminal
     - Or use an emulator on your computer

## Troubleshooting

If you encounter any issues:

1. Make sure all prerequisites are installed correctly
2. Check that you're in the correct project directory
3. Verify that your `.env` file is set up correctly
4. Try stopping the server (press Ctrl+C in the terminal) and running `pnpm dev` again
5. Look for any error messages in the terminal for specific guidance

## Additional Help

If you need more assistance:
- Check the project's issue tracker on GitHub
- Contact the project maintainers
- Review the documentation for specific features

Remember to never share your `.env` file or its contents with others, as it may contain sensitive information.

# New App

## Overview

New App is a web application designed to help users build personalized vocabulary lists from various document formats. By uploading documents like PDF, Word, DOCX, or TXT files, users can highlight unfamiliar words, fetch comprehensive definitions, examples, and context, and store them for personalized learning. The app enhances vocabulary building by integrating with dictionary APIs and provides options to download vocabulary lists for offline access.

## Features

### 1. User Authentication
- **Secure Sign-In:** Users can securely sign in using **ZAPT** with options to use Google, Facebook, or Apple accounts.
- **Data Privacy:** Personal vocabulary lists and uploaded documents are protected and only accessible to authenticated users.

### 2. File Upload
- **Multiple Formats Supported:** Upload documents in PDF, Word, DOCX, or TXT formats.
- **File Management:** Uploaded files are securely stored, and users have the option to delete them when no longer needed.
- **Progress Indicators:** Visual indicators show the upload progress for better user experience.

### 3. Text Highlighting and Vocabulary Extraction
- **Interactive Document Viewer:** Read uploaded documents within the app.
- **Highlight and Extract:** Effortlessly highlight unfamiliar words directly in the document. Highlighted words are automatically extracted and added to the vocabulary list.

### 4. Vocabulary Enrichment
- **Dictionary Integration:** Fetch accurate definitions, examples, and context using the Merriam-Webster Dictionary API.
- **Detailed Word Information:** Provides definitions, part of speech, examples, and optional etymologies or related words.
- **Error Handling:** Notifies users if a word definition could not be fetched.

### 5. Personalized Vocabulary List
- **Comprehensive List View:** View saved words with all fetched information.
- **Add Notes:** Users can add personal notes or custom examples to each word.
- **Manage Vocabulary:** Sort and filter vocabulary lists based on criteria like date added or word type.
- **Delete Words:** Option to remove words from the vocabulary list.

### 6. Text File Generation
- **Download Vocabulary List:** Generate and download a text file containing the vocabulary list for offline access.
- **Formatted Output:** The text file is formatted for readability across different platforms.

### 7. Responsive User Interface
- **Clean Design:** Intuitive and user-friendly interface with a modern look.
- **Responsive Layout:** Optimized for viewing on various devices, including desktops, tablets, and mobile phones.
- **Interactive Elements:** Smooth interactions and feedback for actions like uploads and API requests.

### 8. Error Logging
- **Sentry Integration:** Error logging implemented using Sentry for both frontend and backend to monitor and fix issues promptly.

## User Journey

### 1. Sign In
1. Open the app and click on **Sign in with ZAPT**.
2. Choose a preferred social login option (Google, Facebook, or Apple).
3. Authenticate and gain access to the app's features.

### 2. Uploading a Document
1. Navigate to the **Upload Document** section.
2. Click on **Choose File** and select a document (PDF, Word, DOCX, or TXT).
3. Click **Upload** and wait for the progress bar to reach completion.

### 3. Highlighting Words and Building Vocabulary
1. Once the document is uploaded, it is displayed in the **Document Reader**.
2. Read through the document and highlight unfamiliar words.
3. The app automatically extracts highlighted words and fetches definitions and examples.
4. View the extracted words in the **Vocabulary List** section.

### 4. Managing Vocabulary List
1. In the **Vocabulary List**, view all saved words with definitions and examples.
2. Click on a word to add personal notes or custom examples.
3. Sort or filter the list based on date added or part of speech.
4. Delete any word from the list if desired.

### 5. Downloading Vocabulary List
1. Go to the **Vocabulary List** section.
2. Click on **Download Vocabulary List**.
3. A text file is generated and downloaded to your device.

## External APIs and Services

- **Merriam-Webster Dictionary API:** Used to fetch definitions, examples, and other word-related information.
- **Sentry:** Implemented for error logging on both frontend and backend.
  
**Note:** API keys for external services should be added to the `.env` file as described in the setup instructions.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd new-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add Environment Variables**
   - Create a `.env` file in the root directory.
   - Add the following environment variables:
     ```
     VITE_PUBLIC_APP_ID=your_app_id
     VITE_PUBLIC_SENTRY_DSN=your_sentry_dsn
     VITE_PUBLIC_APP_ENV=development
     MERRIAM_WEBSTER_API_KEY=your_dictionary_api_key
     ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Important Notes

- Ensure that all environment variables are correctly set up for the app to function properly.
- The app uses **Progressier** for PWA functionalities.
- The app icon is set using an external URL and is included in the HTML head for the favicon.

## Version Information

- **SolidJS**: ^1.8.22
- **Tailwind CSS**: ^3.4.13
- **Vite**: ^5.4.7

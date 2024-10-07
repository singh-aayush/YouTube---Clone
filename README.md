# YouTube Clone - Video Sharing Platform

A feature-rich, full-stack video-sharing platform inspired by YouTube, developed using **React**, **Node.js**, **Express**, and **MongoDB**. This platform allows users to create accounts, upload videos, subscribe to channels, manage watch history, and interact with content through likes and comments.

## Features

- **User Authentication**: Secure user registration and login with **JWT** tokens.
- **Video Uploads**: Users can upload videos with custom thumbnails, titles, and descriptions.
- **Subscriptions**: Users can subscribe/unsubscribe to channels and view subscription counts.
- **Watch History**: Unique watch history tracking for each user.
- **Comments & Likes**: Users can leave comments and like videos.
- **Responsive Design**: Mobile and desktop-friendly UI.
- **Search Functionality**: Find videos by title or channel name.
- **User Dashboard**: View personal watch history, subscriptions, and channel statistics.

## Tech Stack

### Frontend
- **React** (UI library)
- **Axios** (for API requests)
- **Vite** (Frontend build tool)
- **CSS/Styled Components** (for responsive design)

### Backend
- **Node.js** with **Express.js** (API and server)
- **MongoDB** (Database for storing user, video, and channel data)
- **Mongoose** (ODM for MongoDB)
- **JWT** (for authentication)
- **Bcrypt** (for password hashing)

## Screenshots
- **Home Page**: Browse videos and channels.
- **Video Player**: Watch videos and interact with comments and likes.
- **User Dashboard**: Manage account settings, subscriptions, and history.
- **Channel Page**: Upload and manage videos.

## Getting Started

To run the project locally, follow these steps:

### Prerequisites

- Node.js v14+ installed
- MongoDB setup (locally or cloud-based like MongoDB Atlas)

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/youtube-clone.git
cd youtube-clone
```

### 2. Backend Setup

Go into the backend directory and install the dependencies:
```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a .env file in the backend directory with the following content:
```bash
MONGO_URI=<your-mongo-db-uri>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=<frontend-url>
```
Replace <your-mongo-db-uri>, <your-jwt-secret>, and <frontend-url> with your actual MongoDB connection string, JWT secret, and frontend URL, respectively.

### 4. Frontend Setup

Go into the frontend directory and install the dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Run the Backend

In the backend directory, start the backend server:
```bash
cd backend
npm run dev
```

### 2. Run the Frontend

In the frontend directory, start the frontend development server:
```bash
cd ../frontend
npm run dev
```

## Access the Application

Open http://localhost:PORT in your browser to access the app.

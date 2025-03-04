# Arvya Platform

A platform for investment circles and community-based financial activities.

## Investment Simulation Flow

The Arvya Platform includes a simulated investment flow that allows users to:

1. Add virtual money to their wallet using the Razorpay payment simulation
2. Invest in different investment circles
3. Track their investments across multiple circles
4. View their investment history and portfolio

### Key Features

- **Wallet Management**: Add virtual money to your wallet using simulated Razorpay payments
- **Investment Circles**: Browse and join investment circles based on your interests
- **Investment Tracking**: Track your investments across different circles
- **Portfolio Overview**: View your complete investment portfolio and history
- **Real-time Updates**: All balances and investment data are updated in real-time

### How to Use

1. **Add Money to Wallet**:
   - Navigate to the Wallet page
   - Click "Add Money"
   - Enter an amount and complete the simulated payment

2. **Explore Investment Circles**:
   - Navigate to the Circles page
   - Browse available circles or create your own
   - Join circles that interest you

3. **Invest in Circles**:
   - Open a circle you've joined
   - Click "Invest Now"
   - Enter an investment amount and confirm

4. **Track Your Investments**:
   - Navigate to the Investments page
   - View your investment summary and history
   - See detailed breakdowns by circle

### Technical Implementation

The investment simulation flow uses local storage to persist data across sessions, including:

- Wallet balance and transaction history
- Investment records and history
- Circle fund pools and progress

All API calls are simulated with appropriate delays to mimic real network requests, providing a realistic user experience without requiring actual payment processing.

### Responsive Design

The entire investment flow is fully responsive and works seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Build

To create a production build:

```bash
npm run build
```

The build is optimized for performance and ready for deployment.

## Technologies Used

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase (simulated)
- Razorpay (simulated)

## Features

- **User Authentication**: Secure login and registration with Firebase Authentication
- **User Profiles**: Create and manage user profiles
- **Investment Circles**: Create, join, and manage investment circles
- **Responsive Design**: Fully responsive UI that works on all devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/arvya-platform.git
   cd arvya-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

### Authentication

1. Go to the Firebase console and create a new project
2. Navigate to "Authentication" and enable Email/Password authentication
3. (Optional) Enable Google authentication or other providers

### Firestore Database

1. Navigate to "Firestore Database" and create a new database
2. Start in production mode or test mode (remember to update security rules later)
3. Set up the following collections:
   - `users`: For user profiles
   - `circles`: For investment circles

### Security Rules

Add these basic security rules to your Firestore database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Circles
    match /circles/{circleId} {
      // Anyone can read public circles
      allow read: if request.auth != null && 
                   (resource.data.type == 'public' || 
                    resource.data.createdBy == request.auth.uid || 
                    request.auth.uid in resource.data.members);
      
      // Only authenticated users can create circles
      allow create: if request.auth != null;
      
      // Only the creator can update or delete
      allow update, delete: if request.auth != null && 
                             resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## Project Structure

```
arvya-platform/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── lib/           # Utility functions and Firebase setup
│   ├── types/         # TypeScript type definitions
│   └── styles/        # Global styles
├── .env.local         # Environment variables (not in repo)
├── next.config.js     # Next.js configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Key Features Implementation

### Investment Circles

The platform allows users to:

1. Create investment circles with:
   - Name, description, goal amount
   - Public or private visibility
   
2. Join existing circles:
   - Browse public circles
   - Join with a single click
   
3. Track progress:
   - See current amount vs. goal amount
   - View member list

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Firebase for the backend services
- Tailwind CSS for the styling utilities
- Framer Motion for the smooth animations

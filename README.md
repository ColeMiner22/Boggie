# Dog Product Recommender

A full-stack web application that provides personalized dog product recommendations based on your dog's profile. Built with React, Firebase, Tailwind CSS, and Stripe.

## Features

- User authentication with Firebase
- Dog profile management
- Personalized product recommendations
- Affiliate links to Amazon and Chewy
- Premium subscription with Stripe
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account
- Stripe account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd dog-product-recommender
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase configuration to the `.env` file

5. Set up Stripe:
   - Create a Stripe account
   - Get your publishable key
   - Add it to the `.env` file

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `build` directory.

## Deployment

The application can be deployed to various platforms:

### Vercel
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
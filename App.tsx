import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import Layout from './components/layout/Layout';
import Navbar from './components/layout/Navbar';
import { auth } from './config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Import your components here
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import DogProfile from './components/dog/DogProfile';
import ProductSearch from './components/products/ProductSearch';
import PremiumSubscription from './components/premium/PremiumSubscription';

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <DogProfile /> : <Navigate to="/login" />} />
            <Route path="/products" element={<ProductSearch />} />
            <Route path="/premium" element={user ? <PremiumSubscription /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/products" />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App; 
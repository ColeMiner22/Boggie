import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
}

interface DogProfile {
  name: string;
  breed: string;
  age: number;
  healthConditions: string[];
  allergies: string[];
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newHealthCondition, setNewHealthCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateDogProfile = (): boolean => {
    if (!isLogin) {
      if (!dogName.trim()) {
        setError('Dog name is required');
        return false;
      }
      if (!dogBreed.trim()) {
        setError('Dog breed is required');
        return false;
      }
      if (!dogAge || isNaN(Number(dogAge)) || Number(dogAge) <= 0) {
        setError('Please enter a valid dog age');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        setLoading(false);
        return;
      }

      if (!isLogin && password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!validateDogProfile()) {
        setLoading(false);
        return;
      }

      let userCredential;

      if (isLogin) {
        // Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: dogName
        });

        // Create dog profile in Firestore
        const dogProfile: DogProfile = {
          name: dogName,
          breed: dogBreed,
          age: Number(dogAge),
          healthConditions,
          allergies
        };

        await setDoc(doc(db, 'dogProfiles', userCredential.user.uid), dogProfile);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle specific Firebase error codes
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please register first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addHealthCondition = () => {
    if (newHealthCondition.trim() && !healthConditions.includes(newHealthCondition.trim())) {
      setHealthConditions([...healthConditions, newHealthCondition.trim()]);
      setNewHealthCondition('');
    }
  };

  const removeHealthCondition = (index: number) => {
    setHealthConditions(healthConditions.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field rounded-t-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`input-field ${!isLogin ? '' : 'rounded-b-md'}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dog Information</h3>
              
              <div>
                <label htmlFor="dog-name" className="block text-sm font-medium text-gray-700">Dog Name</label>
                <input
                  id="dog-name"
                  name="dog-name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your dog's name"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="dog-breed" className="block text-sm font-medium text-gray-700">Breed</label>
                <input
                  id="dog-breed"
                  name="dog-breed"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your dog's breed"
                  value={dogBreed}
                  onChange={(e) => setDogBreed(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="dog-age" className="block text-sm font-medium text-gray-700">Age (years)</label>
                <input
                  id="dog-age"
                  name="dog-age"
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  className="input-field"
                  placeholder="Enter your dog's age"
                  value={dogAge}
                  onChange={(e) => setDogAge(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Health Conditions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Add health condition"
                    value={newHealthCondition}
                    onChange={(e) => setNewHealthCondition(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addHealthCondition}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {healthConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeHealthCondition(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Add allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addAllergy}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={onToggle}
            className="text-primary hover:text-primary/80"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 
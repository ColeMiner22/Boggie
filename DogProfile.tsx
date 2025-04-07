import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

interface DogProfileData {
  name: string;
  breed: string;
  age: number;
  healthConditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  imageUrl: string;
}

const DogProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [profile, setProfile] = useState<DogProfileData>({
    name: '',
    breed: '',
    age: 0,
    healthConditions: [],
    allergies: [],
    dietaryRestrictions: [],
    imageUrl: ''
  });

  const [newHealthCondition, setNewHealthCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'dogProfiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as DogProfileData;
          setProfile(data);
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile || !user) return '';

    const storageRef = ref(storage, `dog-images/${user.uid}/${Date.now()}-${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const addHealthCondition = () => {
    if (newHealthCondition.trim() && !profile.healthConditions.includes(newHealthCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        healthConditions: [...prev.healthConditions, newHealthCondition.trim()]
      }));
      setNewHealthCondition('');
    }
  };

  const removeHealthCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim() && !profile.dietaryRestrictions.includes(newDietaryRestriction.trim())) {
      setProfile(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, newDietaryRestriction.trim()]
      }));
      setNewDietaryRestriction('');
    }
  };

  const removeDietaryRestriction = (index: number) => {
    setProfile(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = profile.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const updatedProfile = {
        ...profile,
        imageUrl
      };

      await updateDoc(doc(db, 'dogProfiles', user.uid), updatedProfile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dog Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Dog Photo</label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Dog"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-secondary cursor-pointer"
              >
                Upload Photo
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Max file size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Dog Name
            </label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
              Breed
            </label>
            <input
              type="text"
              id="breed"
              value={profile.breed}
              onChange={(e) => setProfile(prev => ({ ...prev, breed: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age (years)
            </label>
            <input
              type="number"
              id="age"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
              className="input-field"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Health Conditions</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHealthCondition}
              onChange={(e) => setNewHealthCondition(e.target.value)}
              className="input-field flex-1"
              placeholder="Add health condition"
            />
            <button
              type="button"
              onClick={addHealthCondition}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.healthConditions.map((condition, index) => (
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

        {/* Allergies */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              className="input-field flex-1"
              placeholder="Add allergy"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy, index) => (
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

        {/* Dietary Restrictions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dietary Restrictions</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDietaryRestriction}
              onChange={(e) => setNewDietaryRestriction(e.target.value)}
              className="input-field flex-1"
              placeholder="Add dietary restriction"
            />
            <button
              type="button"
              onClick={addDietaryRestriction}
              className="btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.dietaryRestrictions.map((restriction, index) => (
              <span
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {restriction}
                <button
                  type="button"
                  onClick={() => removeDietaryRestriction(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-500 text-sm text-center">{success}</div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DogProfile; 
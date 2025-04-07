import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  amazonLink: string;
  chewyLink: string;
  suitabilityScore: number;
  suitabilityExplanation: string;
}

interface DogProfile {
  name: string;
  breed: string;
  age: number;
  weight: number;
  allergies: string[];
  healthIssues: string[];
  dietaryRestrictions: string[];
}

const ProductRecommendation: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dogProfile, setDogProfile] = useState<DogProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadDogProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'dogProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDogProfile(docSnap.data() as DogProfile);
        }
      }
    };

    const loadProducts = async () => {
      // In a real application, this would fetch from your backend
      // For now, we'll use mock data
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Dog Food',
          description: 'High-quality dog food suitable for all breeds',
          category: 'food',
          price: 49.99,
          rating: 4.5,
          amazonLink: 'https://amazon.com/product1',
          chewyLink: 'https://chewy.com/product1',
          suitabilityScore: 95,
          suitabilityExplanation: 'Perfect for your dog\'s age and breed',
        },
        // Add more mock products here
      ];
      setProducts(mockProducts);
      setLoading(false);
    };

    loadDogProfile();
    loadProducts();
  }, []);

  const calculateSuitabilityScore = (product: Product): number => {
    if (!dogProfile) return 0;

    let score = 100;
    
    // Example scoring logic (customize based on your needs)
    if (dogProfile.allergies.some(allergy => 
      product.description.toLowerCase().includes(allergy.toLowerCase())
    )) {
      score -= 30;
    }

    if (dogProfile.healthIssues.some(issue => 
      product.description.toLowerCase().includes(issue.toLowerCase())
    )) {
      score -= 20;
    }

    return Math.max(0, score);
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommended Products</h2>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'food'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedCategory('food')}
          >
            Food
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'toys'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setSelectedCategory('toys')}
          >
            Toys
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <div className="bg-primary text-white px-3 py-1 rounded-full">
                {calculateSuitabilityScore(product)}%
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="flex items-center mb-4">
              <span className="text-yellow-400">★</span>
              <span className="ml-1">{product.rating}</span>
              <span className="mx-2">•</span>
              <span className="text-primary font-semibold">${product.price}</span>
            </div>

            <div className="space-y-2">
              <a
                href={product.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center block"
              >
                View on Amazon
              </a>
              <a
                href={product.chewyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full text-center block"
              >
                View on Chewy
              </a>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Why this product?</h4>
              <p className="text-sm text-gray-600">
                {product.suitabilityExplanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendation; 
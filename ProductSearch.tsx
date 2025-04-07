import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  ingredients: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  affiliateLink: string;
}

interface DogProfile {
  name: string;
  breed: string;
  age: number;
  healthConditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
}

interface ProductScore {
  score: number;
  reasons: string[];
}

const ProductSearch: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [dogProfile, setDogProfile] = useState<DogProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'food', name: 'Food' },
    { id: 'toys', name: 'Toys' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'health', name: 'Health Products' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch dog profile
        const profileDoc = await getDocs(query(collection(db, 'dogProfiles'), where('userId', '==', user.uid)));
        if (!profileDoc.empty) {
          setDogProfile(profileDoc.docs[0].data() as DogProfile);
        }

        // Fetch premium status
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userDoc.empty) {
          setIsPremium(userDoc.docs[0].data().isPremium);
        }

        // Fetch products
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const calculateProductScore = (product: Product): ProductScore => {
    if (!dogProfile) return { score: 0, reasons: [] };

    let score = 100;
    const reasons: string[] = [];

    // Check allergies
    dogProfile.allergies.forEach(allergy => {
      if (product.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(allergy.toLowerCase())
      )) {
        score -= 30;
        reasons.push(`Contains ${allergy} which your dog is allergic to`);
      }
    });

    // Check dietary restrictions
    dogProfile.dietaryRestrictions.forEach(restriction => {
      if (product.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(restriction.toLowerCase())
      )) {
        score -= 20;
        reasons.push(`Contains ${restriction} which is restricted in your dog's diet`);
      }
    });

    // Check health conditions
    dogProfile.healthConditions.forEach(condition => {
      if (product.notSuitableFor.some(item => 
        item.toLowerCase().includes(condition.toLowerCase())
      )) {
        score -= 25;
        reasons.push(`Not suitable for dogs with ${condition}`);
      }
    });

    // Add positive reasons
    if (product.suitableFor.some(item => 
      dogProfile.healthConditions.some(condition => 
        item.toLowerCase().includes(condition.toLowerCase())
      )
    )) {
      score += 10;
      reasons.push('Specifically formulated for your dog\'s health conditions');
    }

    // Ensure score stays within 0-100
    score = Math.max(0, Math.min(100, score));

    return { score, reasons };
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .map(product => ({
      ...product,
      ...calculateProductScore(product)
    }))
    .sort((a, b) => b.score - a.score);

  const handleAddToCart = (product: Product) => {
    if (!isPremium) {
      navigate('/premium');
      return;
    }
    // Implement cart functionality here
    console.log('Adding to cart:', product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Search</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-semibold">
                Score: {product.score}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <p className="text-primary font-semibold mb-4">${product.price.toFixed(2)}</p>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-900">Why this product?</h4>
                <ul className="text-sm text-gray-600">
                  {product.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-center"
                >
                  View on Store
                </a>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary flex-1"
                >
                  {isPremium ? 'Add to Cart' : 'Get Premium'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No products found matching your criteria
        </div>
      )}
    </div>
  );
};

export default ProductSearch; 
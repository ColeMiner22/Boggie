import React, { useEffect, useState } from 'react';
import AffiliateProduct from './AffiliateProduct';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  healthConditions: string[];
  dietaryRestrictions: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  platform: 'amazon' | 'chewy';
  productId: string;
  rating: number;
  categories: string[];
  suitableFor: {
    sizes: ('small' | 'medium' | 'large')[];
    healthConditions: string[];
    dietaryRestrictions: string[];
  };
}

interface RecommendedProductsProps {
  dogProfile: DogProfile;
  isPremium?: boolean;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  dogProfile,
  isPremium = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        // Here you would typically make an API call to your backend
        // to fetch recommended products based on the dog's profile
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dogProfile),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [dogProfile]);

  const calculateMatchScore = (product: Product): number => {
    let score = 0;
    let totalFactors = 0;

    // Size match
    if (product.suitableFor.sizes.includes(dogProfile.size)) {
      score += 1;
    }
    totalFactors += 1;

    // Health conditions match
    const matchingHealthConditions = product.suitableFor.healthConditions.filter(
      condition => dogProfile.healthConditions.includes(condition)
    );
    score += matchingHealthConditions.length / Math.max(1, dogProfile.healthConditions.length);
    totalFactors += 1;

    // Dietary restrictions match
    const matchingDietaryRestrictions = product.suitableFor.dietaryRestrictions.filter(
      restriction => dogProfile.dietaryRestrictions.includes(restriction)
    );
    score += matchingDietaryRestrictions.length / Math.max(1, dogProfile.dietaryRestrictions.length);
    totalFactors += 1;

    return score / totalFactors;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-card animate-pulse"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          Error loading recommendations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          No recommendations found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We couldn't find any products that match {dogProfile.name}'s profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Recommended Products for {dogProfile.name}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products
          .map(product => ({
            ...product,
            matchScore: calculateMatchScore(product),
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .map(product => (
            <AffiliateProduct
              key={product.id}
              {...product}
              isPremium={isPremium}
              matchScore={product.matchScore}
            />
          ))}
      </div>
    </div>
  );
};

export default RecommendedProducts; 
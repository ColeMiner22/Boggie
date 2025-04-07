import React from 'react';
import { generateAffiliateUrl, trackAffiliateClick } from '../../config/affiliate';
import { useAuth } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';

interface AffiliateProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  platform: 'amazon' | 'chewy';
  productId: string;
  rating: number;
  matchScore?: number;
  isPremium?: boolean;
}

const AffiliateProduct: React.FC<AffiliateProductProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  platform,
  productId,
  rating,
  matchScore,
  isPremium = false,
}) => {
  const [user] = useAuth(auth);

  const handleAffiliateClick = async () => {
    if (user) {
      await trackAffiliateClick(platform, productId, user.uid);
    }
    window.open(generateAffiliateUrl(platform, productId, name), '_blank');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {isPremium && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Premium
          </div>
        )}
        {matchScore !== undefined && (
          <div className="absolute top-2 left-2 bg-secondary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {Math.round(matchScore * 100)}% Match
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{description}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            ({rating.toFixed(1)})
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            ${price.toFixed(2)}
          </span>
          <button
            onClick={handleAffiliateClick}
            className="btn btn-primary"
          >
            View on {platform === 'amazon' ? 'Amazon' : 'Chewy'}
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          *This is an affiliate link. We may earn a commission if you make a purchase.
        </div>
      </div>
    </div>
  );
};

export default AffiliateProduct; 
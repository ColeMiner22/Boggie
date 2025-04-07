interface AffiliateConfig {
  amazon: {
    trackingId: string;
    baseUrl: string;
  };
  chewy: {
    trackingId: string;
    baseUrl: string;
  };
}

const affiliateConfig: AffiliateConfig = {
  amazon: {
    trackingId: process.env.REACT_APP_AMAZON_ASSOCIATE_ID || '',
    baseUrl: 'https://www.amazon.com',
  },
  chewy: {
    trackingId: process.env.REACT_APP_CHEWY_AFFILIATE_ID || '',
    baseUrl: 'https://www.chewy.com',
  },
};

export const generateAffiliateUrl = (
  platform: 'amazon' | 'chewy',
  productId: string,
  productName: string
): string => {
  const config = affiliateConfig[platform];
  
  if (platform === 'amazon') {
    return `${config.baseUrl}/dp/${productId}?tag=${config.trackingId}`;
  } else if (platform === 'chewy') {
    // Chewy uses a different URL structure
    return `${config.baseUrl}/p/${productName}/${productId}?ref=${config.trackingId}`;
  }
  
  return '';
};

export const trackAffiliateClick = async (
  platform: 'amazon' | 'chewy',
  productId: string,
  userId: string
): Promise<void> => {
  // Here you would implement click tracking logic
  // For example, sending data to your analytics service
  console.log(`Affiliate click tracked: ${platform}, ${productId}, ${userId}`);
};

export default affiliateConfig; 
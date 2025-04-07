import React from 'react';

interface ProductFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedPriceRange: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  categories: string[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  selectedCategory,
  selectedPriceRange,
  onSearchChange,
  onCategoryChange,
  onPriceRangeChange,
  categories,
}) => {
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: 'Over $100' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <select
            value={selectedPriceRange}
            onChange={(e) => onPriceRangeChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || selectedCategory !== 'all' || selectedPriceRange !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
              Search: {searchQuery}
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200">
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange('all')}
                className="ml-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
              >
                ×
              </button>
            </span>
          )}
          {selectedPriceRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200">
              Price: {priceRanges.find((r) => r.value === selectedPriceRange)?.label}
              <button
                onClick={() => onPriceRangeChange('all')}
                className="ml-2 text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters; 
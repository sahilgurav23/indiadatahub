'use client';

import { useState, useMemo } from 'react';
import response1 from '@/data/response1.json';
import response2 from '@/data/response2.json';

interface DataItem {
  id: string;
  title: string;
  cat: string;
  subCat: string;
  subset: string;
  freq: string;
  unit: string;
  src: string;
  sData: string;
  datatype: string;
  region?: string;
}

interface CategoryItem {
  name: string;
  subcategories: string[];
}

interface IconState {
  [key: string]: {
    bookmark: boolean;
    plus: boolean;
    pin: boolean;
    more: boolean;
  };
}

interface ExpandedState {
  [key: string]: boolean;
}

interface HomePageProps {
  onLogout?: () => void;
}

// Region to countries mapping for IMF data
const REGION_COUNTRIES_MAP: Record<string, string[]> = {
  'Africa': ['EGY', 'ETH', 'GHA', 'KEN', 'LBY', 'MUS', 'MAR', 'NGA', 'SOM', 'ZAF', 'SDN', 'TZA', 'UGA', 'ZWE'],
  'Americas': ['ARG', 'BRA', 'CAN', 'CHL', 'COL', 'ECU', 'GUY', 'JAM', 'MEX', 'PER', 'URY', 'VEN', 'LAM'],
  'Asia': ['AFG', 'BGD', 'BTN', 'CHN', 'HKG', 'IND', 'IDN', 'JPN', 'KOR', 'MYS', 'MMR', 'NPL', 'PAK', 'PHL', 'SGP', 'THA', 'VNM'],
  'Australasia': ['AUS', 'NZL'],
  'Europe': ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'RUS', 'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'TUR', 'UKR', 'GBR'],
  'Country Groups': ['ADE', 'AEN', 'EMA', 'EME', 'EUR', 'EUU', 'G7C', 'LAM', 'MEA', 'OAE', 'WLD'],
};

// Country name to ISO 3-letter code mapping for IMF data
const COUNTRY_CODE_MAP: Record<string, string> = {
  // Africa
  'Egypt': 'EGY',
  'Ethiopia': 'ETH',
  'Ghana': 'GHA',
  'Kenya': 'KEN',
  'Libya': 'LBY',
  'Mauritius': 'MUS',
  'Morocco': 'MAR',
  'Nigeria': 'NGA',
  'Somalia': 'SOM',
  'South Africa': 'ZAF',
  'Sudan': 'SDN',
  'Tanzania': 'TZA',
  'Uganda': 'UGA',
  'Zimbabwe': 'ZWE',
  // Americas
  'Argentina': 'ARG',
  'Brazil': 'BRA',
  'Canada': 'CAN',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Mexico': 'MEX',
  'United States': 'USA',
  // Asia
  'Bangladesh': 'BGD',
  'China': 'CHN',
  'Hong Kong': 'HKG',
  'India': 'IND',
  'Indonesia': 'IDN',
  'Japan': 'JPN',
  'Korea': 'KOR',
  'Malaysia': 'MYS',
  'Pakistan': 'PAK',
  'Philippines': 'PHL',
  'Singapore': 'SGP',
  'Thailand': 'THA',
  'Vietnam': 'VNM',
  // Australasia
  'Australia': 'AUS',
  'New Zealand': 'NZL',
  // Europe
  'Austria': 'AUT',
  'Belgium': 'BEL',
  'Bulgaria': 'BGR',
  'Croatia': 'HRV',
  'Cyprus': 'CYP',
  'Czech Republic': 'CZE',
  'Czechia': 'CZE',
  'Denmark': 'DNK',
  'Estonia': 'EST',
  'Finland': 'FIN',
  'France': 'FRA',
  'Germany': 'DEU',
  'Greece': 'GRC',
  'Hungary': 'HUN',
  'Iceland': 'ISL',
  'Ireland': 'IRL',
  'Italy': 'ITA',
  'Latvia': 'LVA',
  'Lithuania': 'LTU',
  'Luxembourg': 'LUX',
  'Malta': 'MLT',
  'Netherlands': 'NLD',
  'Norway': 'NOR',
  'Poland': 'POL',
  'Portugal': 'PRT',
  'Romania': 'ROU',
  'Russian Federation': 'RUS',
  'Slovak Republic': 'SVK',
  'Slovenia': 'SVN',
  'Spain': 'ESP',
  'Sweden': 'SWE',
  'Switzerland': 'CHE',
  'Turkey': 'TUR',
  'Ukraine': 'UKR',
  'United Kingdom': 'GBR',
};

export default function HomePage({ onLogout }: HomePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSubset, setSelectedSubset] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<'india' | 'imf'>('india');
  const [iconStates, setIconStates] = useState<IconState>({});
  const [expandedCategories, setExpandedCategories] = useState<ExpandedState>({});
  const [toolbarFilter, setToolbarFilter] = useState<'bookmark' | 'plus' | 'pin' | null>(null);
  const itemsPerPage = 10;

  const toggleIcon = (itemKey: string, iconType: 'bookmark' | 'plus' | 'pin' | 'more') => {
    setIconStates((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [iconType]: !prev[itemKey]?.[iconType],
      },
    }));
  };

  const toggleExpandCategory = (categoryPath: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryPath]: !prev[categoryPath],
    }));
  };

  // Select data based on source
  const currentData = selectedDataSource === 'india' ? response1 : response2;

  // Get nested subcategories/items from category tree
  const getNestedCategories = (obj: any): string[] => {
    return Object.keys(obj || {});
  };

  // Get all data items from the frequent array in the data
  const allDataItems = useMemo(() => {
    const data = currentData as any;
    if (data.frequent && Array.isArray(data.frequent)) {
      // Deduplicate by id to ensure no duplicates
      const seen = new Set<string>();
      const unique: DataItem[] = [];
      for (const item of data.frequent) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      return unique;
    }
    return [];
  }, [currentData]);

  // Get categories for left sidebar (from categories object for both India and IMF)
  const categories = Object.keys(currentData.categories);

  // Handle data source change
  const handleDataSourceChange = (source: 'india' | 'imf') => {
    setSelectedDataSource(source);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubset(null);
    setCurrentPage(1);
    setSearchQuery('');
  };

  // Get unique subcategories for selected category
  const getUniqueSubcategories = (): string[] => {
    if (!selectedCategory) return [];
    
    if (selectedDataSource === 'imf') {
      // For IMF, get unique subCat values for the selected cat
      const uniqueSubCats = new Set<string>();
      allDataItems
        .filter((item) => item.cat === selectedCategory)
        .forEach((item) => {
          if (item.subCat) uniqueSubCats.add(item.subCat);
        });
      return Array.from(uniqueSubCats).sort();
    }
    return [];
  };

  // Get unique subsets for selected subcategory
  const getUniqueSubsets = (): string[] => {
    if (!selectedCategory || !selectedSubcategory) return [];
    
    return allDataItems
      .filter(
        (item) =>
          item.cat === selectedCategory && item.subCat === selectedSubcategory
      )
      .map((item) => item.subset)
      .filter((subset) => subset !== '')
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
  };

  // Filter items based on search and selected category/subcategory/subset
  const filteredItems = useMemo(() => {
    let filtered = allDataItems;

    if (selectedDataSource === 'imf') {
      // For IMF data: hierarchy is Region → Country → Indicator → SubIndicator
      // selectedCategory = Region (Africa, Americas, etc.)
      // selectedSubcategory = Country (Egypt, USA, etc.)
      // selectedSubset = Indicator (Labour Market, External Sector, etc.)
      
      // Filter by region (get all countries in the region)
      if (selectedCategory && !selectedSubcategory) {
        const regionCountries = REGION_COUNTRIES_MAP[selectedCategory];
        if (regionCountries && regionCountries.length > 0) {
          filtered = filtered.filter((item) => item.region && regionCountries.includes(item.region));
        }
      }
      
      // Filter by country (convert country name to code)
      if (selectedSubcategory) {
        const countryCode = COUNTRY_CODE_MAP[selectedSubcategory];
        if (countryCode) {
          filtered = filtered.filter((item) => item.region === countryCode);
        }
      }

      // Filter by indicator category (cat field)
      if (selectedSubset) {
        filtered = filtered.filter((item) => item.cat === selectedSubset);
      }
    } else {
      // For India data: use exact matching
      if (selectedCategory) {
        filtered = filtered.filter((item) => item.cat === selectedCategory);
      }

      if (selectedSubcategory) {
        filtered = filtered.filter((item) => item.subCat === selectedSubcategory);
      }

      if (selectedSubset) {
        filtered = filtered.filter((item) => item.subset === selectedSubset);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCat.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subset.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply toolbar filter (bookmark, plus/cart, pin)
    if (toolbarFilter) {
      filtered = filtered.filter((item) => iconStates[item.id]?.[toolbarFilter]);
    }

    return filtered;
  }, [selectedCategory, selectedSubcategory, selectedSubset, searchQuery, allDataItems, toolbarFilter, iconStates, selectedDataSource]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Count items in cart (marked with plus action)
  const cartCount = useMemo(() => {
    return allDataItems.filter((item) => iconStates[item.id]?.plus).length;
  }, [allDataItems, iconStates]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a1a4d] text-white">
        <div className="flex items-center justify-between px-6 py-3 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://indiadatahub.com/static/svg/whitename.svg"
              alt="IndiaDataHub Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white rounded text-sm">
              <svg
                className="w-5 h-5 text-gray-400 ml-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search for data and analytics"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="px-4 py-2 text-gray-400 hover:text-gray-600 transition font-medium">
                Search
              </button>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6 flex-shrink-0 text-sm">
            <button className="hover:text-gray-300 transition">Database</button>
            <button className="hover:text-gray-300 transition">Calendar</button>
            <button className="hover:text-gray-300 transition">Help</button>
            {onLogout && (
              <button onClick={onLogout} className="hover:text-gray-300 transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-700 font-bold">
              Economic Monitor
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button className="p-2 border border-gray-300 rounded hover:border-gray-400 transition text-gray-600 hover:text-gray-900">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Bookmark Icon */}
            <button
              onClick={() => setToolbarFilter(toolbarFilter === 'bookmark' ? null : 'bookmark')}
              className={`p-2 border rounded transition relative ${
                toolbarFilter === 'bookmark'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {toolbarFilter === 'bookmark' && (
                <svg className="absolute top-0 right-0 w-4 h-4 text-blue-600 bg-white rounded-full" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>

            {/* Filter Icon */}
            <button className="p-2 border border-gray-300 rounded hover:border-gray-400 transition text-gray-600 hover:text-gray-900">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>

            {/* Selected Count Badge */}
            <span className="text-sm font-medium text-gray-700 px-3 py-1.5">
              Selected ({cartCount})
            </span>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setToolbarFilter(toolbarFilter === 'plus' ? null : 'plus')}
              className={`p-2 border rounded transition relative ${
                toolbarFilter === 'plus'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {toolbarFilter === 'plus' && (
                <svg className="absolute top-0 right-0 w-4 h-4 text-blue-600 bg-white rounded-full" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>

            {/* Pin Icon */}
            <button
              onClick={() => setToolbarFilter(toolbarFilter === 'pin' ? null : 'pin')}
              className={`p-2 border rounded transition relative ${
                toolbarFilter === 'pin'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                <path d="M12 17v5"/>
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
              {toolbarFilter === 'pin' && (
                <svg className="absolute top-0 right-0 w-4 h-4 text-blue-600 bg-white rounded-full" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>

            {/* View Graph Button */}
            <button className="bg-[#1a1a4d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#0f0f2e] transition flex items-center gap-2">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Graph
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          {/* Categories Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Categories
            </label>
            <select
              value={selectedDataSource}
              onChange={(e) => handleDataSourceChange(e.target.value as 'india' | 'imf')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a4d]"
            >
              <option value="india">India & States</option>
              <option value="imf">IMF</option>
            </select>
          </div>

          <hr className="my-4" />

          {/* Collapsible Categories Tree */}
          <nav className="space-y-1 max-h-96 overflow-y-auto">
            {categories.map((category) => {
              const categoryPath = category;
              const isExpanded = expandedCategories[categoryPath];
              const subcategoryData = currentData.categories[category as keyof typeof currentData.categories];
              const subcategories = getNestedCategories(subcategoryData);

              return (
                <div key={category} className="mb-1">
                  {/* Main Category */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpandCategory(categoryPath)}
                      className="p-1 hover:bg-gray-300 rounded transition flex-shrink-0"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        className={`w-4 h-4 text-gray-700 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(
                          selectedCategory === category ? null : category
                        );
                        setSelectedSubcategory(null);
                        setSelectedSubset(null);
                        setCurrentPage(1);
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded text-sm font-medium transition ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && subcategories.length > 0 && (
                    <div className="ml-5 mt-1 space-y-0 border-l-2 border-gray-300 pl-2">
                      {subcategories.map((subcategory) => {
                        const subcategoryPath = `${categoryPath}/${subcategory}`;
                        const isSubExpanded = expandedCategories[subcategoryPath];
                        const nestedData = subcategoryData[subcategory as keyof typeof subcategoryData];
                        const nestedItems = getNestedCategories(nestedData);

                        return (
                          <div key={subcategory} className="mb-0.5">
                            {/* Subcategory */}
                            <div className="flex items-center gap-1">
                              {nestedItems.length > 0 && (
                                <button
                                  onClick={() => toggleExpandCategory(subcategoryPath)}
                                  className="p-1 hover:bg-gray-300 rounded transition flex-shrink-0"
                                  title={isSubExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg
                                    className={`w-3 h-3 text-gray-600 transition-transform ${
                                      isSubExpanded ? 'rotate-90' : ''
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                              {nestedItems.length === 0 && (
                                <div className="w-6 flex-shrink-0" />
                              )}
                              <button
                                onClick={() => {
                                  setSelectedSubcategory(
                                    selectedSubcategory === subcategory ? null : subcategory
                                  );
                                  setSelectedSubset(null);
                                  setCurrentPage(1);
                                }}
                                className={`flex-1 text-left px-2 py-1.5 rounded text-sm transition ${
                                  selectedSubcategory === subcategory
                                    ? 'bg-gradient-to-r from-[#4d4d7f] to-[#3d3d6f] text-white font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
                                }`}
                              >
                                {subcategory}
                              </button>
                            </div>

                            {/* Nested Items */}
                            {isSubExpanded && nestedItems.length > 0 && (
                              <div className="ml-5 mt-0.5 space-y-0 border-l-2 border-gray-300 pl-2">
                                {nestedItems.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() => {
                                      setSelectedSubset(
                                        selectedSubset === item ? null : item
                                      );
                                      setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded text-sm transition block ${
                                      selectedSubset === item
                                        ? 'bg-gradient-to-r from-[#6d6d9f] to-[#5d5d8f] text-white font-medium shadow-sm'
                                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
                                    }`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-6">
          {/* Content Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDataSource === 'imf' ? (
                  // For IMF: show breadcrumb with selected hierarchy levels
                  <>
                    {selectedSubcategory ? (
                      <>
                        {selectedSubset ? (
                          `${selectedSubcategory} / ${selectedSubset} (${filteredItems.length})`
                        ) : (
                          `${selectedSubcategory} (${filteredItems.length})`
                        )}
                      </>
                    ) : selectedCategory ? (
                      `${selectedCategory} (${filteredItems.length})`
                    ) : (
                      `All Categories (${filteredItems.length})`
                    )}
                  </>
                ) : (
                  // For India: show category with count
                  selectedCategory ? `${selectedCategory} (${filteredItems.length})` : `All Categories (${filteredItems.length})`
                )}
              </h2>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
                {selectedDataSource === 'india' ? 'India & States' : 'IMF'}
              </span>
            </div>

            {/* Column Headers */}
            <div className="grid gap-4 px-4 py-3 bg-gray-100 rounded font-semibold text-sm text-gray-700 border border-gray-200" style={{ gridTemplateColumns: '2fr 1fr 1fr 0.8fr' }}>
              <div>New Releases</div>
              <div>Range</div>
              <div>Unit</div>
              <div>Actions</div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="space-y-2">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const itemKey = item.id;
                const isBookmarkActive = iconStates[itemKey]?.bookmark;
                const isPlusActive = iconStates[itemKey]?.plus;
                const isPinActive = iconStates[itemKey]?.pin;
                const isMoreActive = iconStates[itemKey]?.more;

                return (
                  <div
                    key={itemKey}
                    className="border border-gray-200 rounded hover:bg-gray-50 transition"
                  >
                    <div className="grid gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 0.8fr' }}>
                      <div>
                        <div className="text-gray-900 font-bold mb-2">{item.title}</div>
                        <div className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                          {selectedDataSource === 'imf' 
                            ? `${item.region || 'N/A'} / ${item.cat} / ${item.subCat}`
                            : `${item.cat} / ${item.subCat} ${item.subset && `/ ${item.subset}`}`
                          }
                        </div>
                      </div>
                      <div className="text-gray-700 flex items-center">{item.freq}</div>
                      <div className="text-gray-600 flex items-center">{item.unit}</div>
                      <div className="flex items-center gap-3">
                        {/* Bookmark Icon */}
                        <button
                          onClick={() => toggleIcon(itemKey, 'bookmark')}
                          className="transition p-1"
                          style={{
                            color: '#9ca3af',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isBookmarkActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isBookmarkActive ? 'rgb(97, 83, 239)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                            <line x1="15" x2="9" y1="10" y2="10" stroke={isBookmarkActive ? 'rgb(97, 83, 239)' : 'currentColor'}/>
                          </svg>
                        </button>

                        {/* Square Plus Icon */}
                        <button
                          onClick={() => toggleIcon(itemKey, 'plus')}
                          className="transition p-0.5 rounded"
                          style={{
                            backgroundColor: isPlusActive ? 'rgb(97, 83, 239)' : 'transparent',
                            padding: '2px',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isPlusActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isPlusActive ? 'rgb(97, 83, 239)' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" fill={isPlusActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isPlusActive ? 'rgb(97, 83, 239)' : '#9ca3af'}/>
                            <path d="M8 12h8" stroke={isPlusActive ? 'white' : '#9ca3af'}/>
                            <path d="M12 8v8" stroke={isPlusActive ? 'white' : '#9ca3af'}/>
                          </svg>
                        </button>

                        {/* Pin Icon */}
                        <button
                          onClick={() => toggleIcon(itemKey, 'pin')}
                          className="transition p-1"
                          style={{
                            color: isPinActive ? 'rgb(97, 83, 239)' : '#9ca3af',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isPinActive ? 'rgb(97, 83, 239)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                            <path d="M12 17v5"/>
                            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                          </svg>
                        </button>

                        {/* More Options Icon */}
                        <button
                          onClick={() => toggleIcon(itemKey, 'more')}
                          className="transition p-1"
                          style={{
                            color: isMoreActive ? 'rgb(97, 83, 239)' : '#9ca3af',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isMoreActive ? 'rgb(97, 83, 239)' : 'currentColor'}>
                            <path d="M12 8a2 2 0 110-4 2 2 0 010 4zM12 14a2 2 0 110-4 2 2 0 010 4zM12 20a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{' '}
                {filteredItems.length} records
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>

                {/* Page number input and total */}
                <div className="flex items-center gap-2 mx-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value) || 1;
                      handlePageChange(page);
                    }}
                    className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                  <span className="text-sm text-gray-600">of {totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

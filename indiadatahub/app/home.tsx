'use client';

import { useState, useMemo, useEffect } from 'react';
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
  const [isClient, setIsClient] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 10;

  // Load icon states from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedIconStates = localStorage.getItem('iconStates');
    if (savedIconStates) {
      try {
        setIconStates(JSON.parse(savedIconStates));
      } catch (e) {
        console.error('Failed to parse saved icon states:', e);
      }
    }
  }, []);

  // Save icon states to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('iconStates', JSON.stringify(iconStates));
    }
  }, [iconStates, isClient]);

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
          (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (item.cat?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (item.subCat?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (item.subset?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
      <header className="bg-[#1a1a4d] text-white sticky top-0 z-40">
        {/* Top Row - Logo and Navigation */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://indiadatahub.com/static/svg/whitename.svg"
              alt="IndiaDataHub Logo"
              className="h-8 md:h-10 w-auto"
            />
          </div>

          {/* Right Navigation - Mobile Compact */}
          <div className="flex items-center gap-1 md:gap-6 flex-shrink-0 text-xs md:text-sm">
            <button className="hidden sm:inline hover:text-gray-300 transition px-2 py-1 rounded hover:bg-white hover:bg-opacity-10">Database</button>
            <button className="hidden sm:inline hover:text-gray-300 transition px-2 py-1 rounded hover:bg-white hover:bg-opacity-10">Calendar</button>
            <button className="hidden sm:inline hover:text-gray-300 transition px-2 py-1 rounded hover:bg-white hover:bg-opacity-10">Help</button>
            {onLogout && (
              <button onClick={onLogout} className="hidden sm:inline hover:text-gray-300 transition px-2 py-1 rounded hover:bg-white hover:bg-opacity-10">
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row - Search Bar */}
        <div className="px-3 md:px-6 pb-2 md:pb-3">
          <div className="flex items-center bg-white rounded text-sm">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400 ml-2 md:ml-3 flex-shrink-0"
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
              className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-white text-gray-700 placeholder-gray-400 focus:outline-none text-xs md:text-sm"
            />
            <button className="px-2 md:px-4 py-1.5 md:py-2 text-gray-400 hover:text-gray-600 transition font-medium text-xs md:text-sm flex-shrink-0">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 md:px-6 py-2 md:py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            {/* Sidebar Toggle Button for Mobile */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition flex-shrink-0"
              title="Toggle Categories"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition flex-shrink-0">
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
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
            <span className="text-xs md:text-sm text-gray-700 font-bold truncate">
              Economic Monitor
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-3 flex-wrap w-full md:w-auto">
            {/* Search Icon */}
            <button className="hidden md:block p-2 border border-gray-300 rounded hover:border-gray-400 transition text-gray-600 hover:text-gray-900">
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
              className={`p-1 md:p-2 border rounded transition relative flex-shrink-0 ${
                toolbarFilter === 'bookmark'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
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
            <button className="hidden md:block p-1 md:p-2 border border-gray-300 rounded hover:border-gray-400 transition text-gray-600 hover:text-gray-900">
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
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
            <span className="text-xs md:text-sm font-medium text-gray-700 px-2 md:px-3 py-1.5 whitespace-nowrap">
              Selected ({cartCount})
            </span>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setToolbarFilter(toolbarFilter === 'plus' ? null : 'plus')}
              className={`p-1 md:p-2 border rounded transition relative flex-shrink-0 ${
                toolbarFilter === 'plus'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
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
              className={`p-1 md:p-2 border rounded transition relative flex-shrink-0 ${
                toolbarFilter === 'pin'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }} className="md:w-5 md:h-5">
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
            <button 
              onClick={() => setShowGraphModal(true)}
              className="bg-[#1a1a4d] text-white px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm font-medium hover:bg-[#0f0f2e] transition flex items-center gap-1 md:gap-2 whitespace-nowrap flex-shrink-0">
              <svg
                className="w-3 h-3 md:w-4 md:h-4"
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

      {/* Sidebar Overlay Backdrop - Mobile Only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className={`${sidebarOpen ? 'flex flex-col' : 'hidden'} lg:flex lg:flex-col w-full lg:w-64 bg-gray-50 border-r border-gray-200 lg:min-h-screen fixed lg:static left-0 lg:left-auto top-0 lg:top-auto h-screen lg:h-auto z-40 lg:z-auto`}>
          {/* Sidebar Header with Close Button */}
          <div className="flex items-center justify-between px-4 py-3 lg:hidden border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600 hover:text-gray-900 active:text-gray-800 transition flex-shrink-0 p-1.5 rounded hover:bg-gray-100"
              title="Close sidebar"
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
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
            </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-4 md:p-6 w-full">
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
            <div className="hidden md:grid gap-4 px-4 py-3 bg-gray-100 rounded font-semibold text-sm text-gray-700 border border-gray-200" style={{ gridTemplateColumns: '2fr 1fr 1fr 0.8fr' }}>
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
                    {/* Mobile View - Card Layout */}
                    <div className="md:hidden px-4 py-3 text-sm space-y-2">
                      <div>
                        <div className="text-gray-900 font-bold mb-2">{item.title}</div>
                        <div className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                          {selectedDataSource === 'imf' 
                            ? `${item.region || 'N/A'} / ${item.cat} / ${item.subCat}`
                            : `${item.cat} / ${item.subCat} ${item.subset && `/ ${item.subset}`}`
                          }
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600"><strong>Range:</strong> {item.freq}</span>
                        <span className="text-gray-600"><strong>Unit:</strong> {item.unit}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        {/* Bookmark Icon */}
                        <button
                          onClick={() => toggleIcon(itemKey, 'bookmark')}
                          className="transition p-1"
                          style={{ color: '#9ca3af' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarkActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isBookmarkActive ? 'rgb(97, 83, 239)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                            <line x1="15" x2="9" y1="10" y2="10" stroke={isBookmarkActive ? 'rgb(97, 83, 239)' : 'currentColor'}/>
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleIcon(itemKey, 'plus')}
                          className="transition p-0.5 rounded"
                          style={{ backgroundColor: isPlusActive ? 'rgb(97, 83, 239)' : 'transparent', padding: '2px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isPlusActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isPlusActive ? 'rgb(97, 83, 239)' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" fill={isPlusActive ? 'rgb(97, 83, 239)' : 'none'} stroke={isPlusActive ? 'rgb(97, 83, 239)' : '#9ca3af'}/>
                            <path d="M8 12h8" stroke={isPlusActive ? 'white' : '#9ca3af'}/>
                            <path d="M12 8v8" stroke={isPlusActive ? 'white' : '#9ca3af'}/>
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleIcon(itemKey, 'pin')}
                          className="transition p-1"
                          style={{ color: isPinActive ? 'rgb(97, 83, 239)' : '#9ca3af' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isPinActive ? 'rgb(97, 83, 239)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}>
                            <path d="M12 17v5"/>
                            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleIcon(itemKey, 'more')}
                          className="transition p-1"
                          style={{ color: isMoreActive ? 'rgb(97, 83, 239)' : '#9ca3af' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isMoreActive ? 'rgb(97, 83, 239)' : 'currentColor'}>
                            <path d="M12 8a2 2 0 110-4 2 2 0 010 4zM12 14a2 2 0 110-4 2 2 0 010 4zM12 20a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Desktop View - Table Layout */}
                    <div className="hidden md:grid gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 0.8fr' }}>
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
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-6 pt-4 border-t border-gray-200 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 md:px-3 py-1 border border-gray-300 rounded text-xs md:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value, 10);
                    if (!isNaN(page)) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-10 md:w-12 px-2 py-1 border border-gray-300 rounded text-xs md:text-sm text-center"
                />
                <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">of {totalPages}</span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 md:px-3 py-1 border border-gray-300 rounded text-xs md:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl md:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Data Visualization</h3>
              <button
                onClick={() => setShowGraphModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6">
              {paginatedItems.length > 0 ? (
                <div className="space-y-3 md:space-y-6">
                  {/* Bar Chart */}
                  <div className="bg-gray-50 p-3 md:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Items Distribution by Category</h4>
                    <div className="h-48 md:h-80 bg-white rounded border border-gray-200 flex items-end justify-around p-1 md:p-4 gap-0.5 md:gap-2 overflow-x-auto">
                      {paginatedItems.slice(0, 8).map((item, idx) => {
                        const maxHeight = 300;
                        const height = Math.random() * maxHeight;
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                            <div
                              className="w-full bg-gradient-to-t from-[#1a1a4d] to-[#4d4d7f] rounded-t transition hover:opacity-80"
                              style={{ height: `${height}px` }}
                              title={item.title}
                            />
                            <span className="text-xs text-gray-600 text-center truncate w-full">
                              {item.cat?.substring(0, 8)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Line Chart */}
                  <div className="bg-gray-50 p-3 md:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Data Trend Over Time</h4>
                    <div className="h-48 md:h-80 bg-white rounded border border-gray-200 relative p-1 md:p-4">
                      <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line
                            key={`h-${i}`}
                            x1="0"
                            y1={i * 75}
                            x2="800"
                            y2={i * 75}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <line
                            key={`v-${i}`}
                            x1={i * 100}
                            y1="0"
                            x2={i * 100}
                            y2="300"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        {/* Line chart */}
                        <polyline
                          points={Array.from({ length: 9 }, (_, i) => `${i * 100},${150 - Math.sin(i * 0.5) * 80}`).join(' ')}
                          fill="none"
                          stroke="#1a1a4d"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data points */}
                        {Array.from({ length: 9 }, (_, i) => (
                          <circle
                            key={`dot-${i}`}
                            cx={i * 100}
                            cy={150 - Math.sin(i * 0.5) * 80}
                            r="5"
                            fill="#1a1a4d"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-gray-50 p-3 md:p-6 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Category Breakdown</h4>
                    <div className="h-48 md:h-80 bg-white rounded border border-gray-200 flex items-center justify-center">
                      <svg className="w-40 h-40 md:w-64 md:h-64" viewBox="0 0 200 200">
                        {/* Pie slices */}
                        <circle cx="100" cy="100" r="80" fill="#1a1a4d" opacity="0.8" />
                        <circle cx="100" cy="100" r="60" fill="white" />
                        
                        {/* Slice 1 */}
                        <path
                          d="M 100 100 L 180 100 A 80 80 0 0 1 156.57 156.57 Z"
                          fill="#4d4d7f"
                          opacity="0.9"
                        />
                        {/* Slice 2 */}
                        <path
                          d="M 100 100 L 156.57 156.57 A 80 80 0 0 1 20 100 Z"
                          fill="#6d6d9f"
                          opacity="0.9"
                        />
                        {/* Slice 3 */}
                        <path
                          d="M 100 100 L 20 100 A 80 80 0 0 1 100 20 Z"
                          fill="#8d8dbf"
                          opacity="0.9"
                        />
                        
                        {/* Labels */}
                        <text x="140" y="100" fontSize="12" fill="#1a1a4d" fontWeight="bold">35%</text>
                        <text x="60" y="150" fontSize="12" fill="#1a1a4d" fontWeight="bold">40%</text>
                        <text x="70" y="50" fontSize="12" fill="#1a1a4d" fontWeight="bold">25%</text>
                      </svg>
                    </div>
                    <div className="mt-3 md:mt-4 grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-[#4d4d7f] rounded flex-shrink-0"></div>
                        <span className="text-gray-700 truncate text-xs md:text-sm">Category A (35%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-[#6d6d9f] rounded flex-shrink-0"></div>
                        <span className="text-gray-700 truncate text-xs md:text-sm">Category B (40%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-[#8d8dbf] rounded flex-shrink-0"></div>
                        <span className="text-gray-700 truncate text-xs md:text-sm">Category C (25%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No data available to display</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-3 md:p-6 border-t border-gray-200 sticky bottom-0 bg-white flex-shrink-0">
              <button
                onClick={() => setShowGraphModal(false)}
                className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

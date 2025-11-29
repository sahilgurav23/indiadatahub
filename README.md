# IndiaDataHub

A modern, responsive web application for exploring and visualizing India's economic and statistical data, with support for IMF international data.

## 🌟 Features

### Data Management
- **Dual Data Sources**: Support for India & States data and IMF international data
- **Hierarchical Navigation**: Browse data through category, subcategory, and subset filtering
- **Real-time Search**: Search across data titles, categories, and subcategories
- **Pagination**: 10 items per page for optimal performance and user experience
- **Data Deduplication**: Automatic deduplication of data items to ensure data integrity

### User Interactions
- **Bookmark**: Mark favorite data items for quick access
- **Add to Cart**: Add items to a shopping cart for batch operations
- **Pin Items**: Pin important data items for priority viewing
- **More Options**: Extended menu for additional actions
- **Toolbar Filtering**: Filter data by bookmarked, pinned, or added items

### Data Visualization
- **Interactive Graphs**: View data through multiple visualization types:
  - Bar Charts: Distribution analysis
  - Line Charts: Trend analysis over time
  - Pie Charts: Category breakdown with percentages
- **Modal-based Viewer**: Full-screen graph visualization with responsive design
- **SVG Charts**: Custom SVG-based charts without external dependencies

### Responsive Design
- **Mobile-First Approach**: Optimized for all screen sizes
- **Collapsible Sidebar**: Toggle category navigation on mobile devices
- **Responsive Tables**: Card-based layout on mobile, grid layout on desktop
- **Adaptive Header**: Compact header on small screens, full header on desktop
- **Touch-Friendly**: Large touch targets and spacing for mobile users

### State Management
- **LocalStorage Persistence**: User preferences (bookmarks, pins, cart) persist across sessions
- **Category Persistence**: Selected categories and filters maintained during navigation
- **Search History**: Search queries maintained during browsing

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 14+**: React-based framework with server-side rendering and static generation
- **React 18+**: UI component library with hooks for state management
- **TypeScript**: Type-safe JavaScript for better code quality and developer experience

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Responsive Design**: Mobile-first approach with breakpoints (sm, md, lg, xl)
- **Custom SVG Graphics**: Charts and icons built with SVG for scalability

### State Management
- **React Hooks**: useState, useMemo, useEffect for component state
- **LocalStorage API**: Browser storage for persisting user preferences
- **Context-based Filtering**: Centralized filtering logic with memoization

### Data Handling
- **JSON Data**: Static JSON files for India and IMF data
- **Data Filtering**: Multi-level filtering by category, subcategory, and subset
- **Search Algorithm**: Case-insensitive substring matching across multiple fields

### Build & Deployment
- **Node.js**: JavaScript runtime environment
- **npm/yarn**: Package management
- **Vercel/Netlify Ready**: Optimized for modern deployment platforms

## 📁 Project Structure

```
indiadatahub/
├── app/
│   ├── home.tsx              # Main application component
│   ├── layout.tsx            # Root layout wrapper
│   ├── globals.css           # Global styles and Tailwind imports
│   └── page.tsx              # Home page entry point
├── data/
│   ├── response1.json        # India & States data
│   └── response2.json        # IMF international data
├── public/                   # Static assets
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
└── README.md                 # Project documentation
```

## 📊 Data Structure

### India Data (response1.json)
```json
{
  "categories": {
    "Category Name": {
      "Subcategory": ["Item1", "Item2"]
    }
  },
  "frequent": [
    {
      "id": "unique-id",
      "title": "Data Item Title",
      "cat": "Category",
      "subCat": "Subcategory",
      "subset": "Subset (optional)",
      "freq": "Frequency (Annual, Quarterly)",
      "unit": "Unit of Measurement",
      "src": "Data Source",
      "sData": "Source Data",
      "datatype": "Data Type",
      "hierarchy": "Hierarchy Level"
    }
  ]
}
```

### IMF Data (response2.json)
```json
{
  "categories": {
    "Region": {
      "Country": ["Indicator1", "Indicator2"]
    }
  },
  "frequent": [
    {
      "id": "unique-id",
      "title": "Data Item Title",
      "cat": "Indicator Category",
      "subCat": "Sub-indicator",
      "subset": "Subset",
      "freq": "Frequency",
      "unit": "Unit",
      "region": "Country Code (ISO 3-letter)",
      "src": "Source",
      "sData": "Source Data",
      "datatype": "Data Type"
    }
  ]
}
```

## 🎯 Key Components

### HomePage Component
Main application component with:
- Data source management (India/IMF)
- Category and subcategory navigation
- Search and filtering logic
- Pagination management
- Icon state management (bookmark, pin, plus, more)
- Graph modal visualization

### Data Filtering
Multi-level filtering system:
1. **Category Filter**: Select main category
2. **Subcategory Filter**: Select subcategory within category
3. **Subset Filter**: Select specific subset
4. **Search Filter**: Full-text search across all fields
5. **Toolbar Filter**: Filter by user actions (bookmark, pin, cart)

### Responsive Layouts

#### Mobile (< 768px)
- Full-width sidebar with overlay backdrop
- Card-based data table layout
- Compact header with hamburger menu
- Stacked navigation elements
- Touch-optimized buttons and spacing

#### Desktop (≥ 768px)
- Fixed sidebar navigation
- Grid-based data table
- Full header with all navigation visible
- Horizontal layout for optimal use of space

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd indiadatahub

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev

# Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: 1024px - 1280px (lg)
- **Large Desktop**: ≥ 1280px (xl)

## 🎨 UI/UX Features

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast color scheme
- Readable font sizes

### Performance
- Memoized filtering logic (useMemo)
- Pagination for large datasets
- Lazy loading of components
- Optimized SVG charts
- Efficient state updates

### User Experience
- Smooth transitions and hover effects
- Loading states and feedback
- Clear visual hierarchy
- Intuitive navigation
- Persistent user preferences

## 🔧 Configuration

### Tailwind CSS
Configured in `tailwind.config.js` with:
- Custom color palette
- Extended spacing scale
- Custom breakpoints
- Plugin extensions

### TypeScript
Strict mode enabled for type safety:
- Interface definitions for data structures
- Type-safe component props
- Generic type support

## 📝 Recent Updates

### Responsive Design Improvements
- Fixed header layout for mobile devices
- Implemented collapsible sidebar for small screens
- Made data table responsive with card layout on mobile
- Optimized graph modal for all screen sizes
- Added overlay backdrop for mobile sidebar

### Feature Enhancements
- LocalStorage persistence for user preferences
- Multi-level data filtering
- Real-time search functionality
- SVG-based data visualization
- Toolbar filtering by user actions

## 🐛 Known Issues & Limitations

- Graph data is randomly generated (not connected to actual data)
- IMF data requires country code mapping for proper filtering
- Search is case-insensitive substring matching

## 🔮 Future Enhancements

- Real data integration for graphs
- Export functionality (CSV, Excel, PDF)
- Advanced filtering options
- Data comparison tools
- User authentication
- Saved reports and dashboards
- API integration for live data
- Dark mode support

## 📄 License

This project is part of IndiaDataHub initiative.

## 👥 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.
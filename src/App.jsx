import { useState, useEffect, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from "recharts";
import { Moon, Sun, Map, BarChart3, Filter, Globe, Calendar, TrendingUp, MapPin, Layers, RefreshCw } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia",
  "North Korea", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway",
  "Oman",
  "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  "Holy See", "State of Palestine"
].sort();

const createCustomIcon = (magnitude, isSelected = false) => {
  const getColor = (mag) => {
    if (mag >= 7) return '#7c2d12'; // Very strong - dark red
    if (mag >= 6) return '#ef4444'; // Strong - red
    if (mag >= 5) return '#f59e0b'; // Moderate - amber
    if (mag >= 4) return '#eab308'; // Light - yellow
    if (mag >= 3) return '#22c55e'; // Minor - green  
    return '#6b7280'; // Micro - gray
  };
  
  const color = getColor(magnitude);
  const size = Math.max(12, Math.min(magnitude * 6, 36));
  const pulseAnimation = isSelected ? 'animation: pulse 2s infinite;' : '';
  
  return L.divIcon({
    html: `
      <div style="
        ${pulseAnimation}
        background: radial-gradient(circle, ${color}, ${color}dd);
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 ${isSelected ? '6px' : '0px'} rgba(59, 130, 246, 0.3);
        position: relative;
        transition: all 0.3s ease;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: ${Math.max(8, size/3)}px;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        ">${magnitude.toFixed(1)}</div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-earthquake-marker',
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12)/2, (size + 12)/2]
  });
};

function EarthquakeMap({ data, selected, isDark, onMarkerClick, mapStyle }) {
  const map = useMap();
  
  useEffect(() => {
    if (selected && map) {
      map.flyTo(selected.coordinates, 8, { 
        duration: 1.5,
        easeLinearity: 0.5
      });
    }
  }, [selected, map]);

  // Update map style when theme changes
  useEffect(() => {
    if (map) {
      map.getPane('tilePane').style.filter = isDark ? 'invert(1) hue-rotate(180deg) brightness(0.8)' : 'none';
    }
  }, [isDark, map]);

  const handleMarkerClick = useCallback((earthquake) => {
    onMarkerClick(earthquake);
  }, [onMarkerClick]);

  return (
    <>
      <TileLayer
        url={mapStyle === 'satellite' 
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : mapStyle === 'terrain'
          ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
        attribution="&copy; OpenStreetMap contributors"
        key={mapStyle}
      />
      
      {data.map((eq) => (
        <Marker 
          key={eq.id} 
          position={eq.coordinates}
          icon={createCustomIcon(eq.magnitude, selected && selected.id === eq.id)}
          eventHandlers={{
            click: () => handleMarkerClick(eq),
            mouseover: (e) => {
              e.target.openPopup();
            }
          }}
        >
          <Popup 
            closeButton={true}
            autoPan={true}
            className="custom-popup"
          >
            <div className="text-sm min-w-[280px] max-w-[320px]">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-5 h-5 rounded-full border-2 border-white shadow-lg"
                  style={{ 
                    backgroundColor: eq.magnitude >= 7 ? '#7c2d12' : eq.magnitude >= 6 ? '#ef4444' : eq.magnitude >= 5 ? '#f59e0b' : eq.magnitude >= 4 ? '#eab308' : eq.magnitude >= 3 ? '#22c55e' : '#6b7280'
                  }}
                ></div>
                <h3 className="font-bold text-lg text-gray-900">
                  Magnitude {eq.magnitude}
                </h3>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">{eq.place}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Depth:</span>
                    <p className="text-gray-900">{eq.depth} km</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Country:</span>
                    <p className="text-gray-900">{eq.country}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-600">Time:</span>
                  <p className="text-gray-900 text-xs">{eq.time}</p>
                </div>
                
                <div className="pt-2">
                  <span className="font-medium text-gray-600">Coordinates:</span>
                  <p className="text-gray-900 text-xs">
                    {eq.coordinates[0].toFixed(4)}°, {eq.coordinates[1].toFixed(4)}°
                  </p>
                </div>

                {/* Severity indicator */}
                <div className="pt-2">
                  <span className="font-medium text-gray-600">Severity:</span>
                  <p className={`text-sm font-medium ${
                    eq.magnitude >= 7 ? 'text-red-900' : 
                    eq.magnitude >= 6 ? 'text-red-700' : 
                    eq.magnitude >= 5 ? 'text-orange-600' : 
                    eq.magnitude >= 4 ? 'text-yellow-600' : 
                    eq.magnitude >= 3 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {eq.magnitude >= 7 ? 'Major' : 
                     eq.magnitude >= 6 ? 'Strong' : 
                     eq.magnitude >= 5 ? 'Moderate' : 
                     eq.magnitude >= 4 ? 'Light' : 
                     eq.magnitude >= 3 ? 'Minor' : 'Micro'}
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mapStyle, setMapStyle] = useState('standard');
  const [refreshing, setRefreshing] = useState(false);
  
  // Enhanced filters with custom date selection
  const [filters, setFilters] = useState({
    minMagnitude: 0,
    maxMagnitude: 10,
    country: 'all',
    timeRange: 'day',
    customStartDate: '',
    customEndDate: '',
    depthRange: [0, 1000],
    useCustomDate: false
  });

  // Get date range for custom selection
  const getDateRange = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      min: thirtyDaysAgo.toISOString().split('T')[0],
      max: now.toISOString().split('T')[0]
    };
  };

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      let url;
      if (filters.useCustomDate && filters.customStartDate && filters.customEndDate) {
        // For custom date range, we'll use the month feed and filter client-side
        // USGS doesn't provide custom date range API, so this is a limitation
        url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
      } else {
        const endpoints = {
          day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
          week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
          month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
        };
        url = endpoints[filters.timeRange];
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      let earthquakes = result.features.map(f => ({
        id: f.id,
        place: f.properties.place || 'Unknown location',
        magnitude: f.properties.mag || 0,
        time: new Date(f.properties.time).toLocaleString(),
        timestamp: f.properties.time,
        depth: Math.abs(f.geometry.coordinates[2]) || 0,
        coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
        country: extractCountry(f.properties.place || '')
      }));

      // Filter by custom date range if enabled
      if (filters.useCustomDate && filters.customStartDate && filters.customEndDate) {
        const startTime = new Date(filters.customStartDate).getTime();
        const endTime = new Date(filters.customEndDate).getTime() + 24 * 60 * 60 * 1000; // Include full end day
        
        earthquakes = earthquakes.filter(eq => 
          eq.timestamp >= startTime && eq.timestamp <= endTime
        );
      }
      
      setData(earthquakes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.timeRange, filters.useCustomDate, filters.customStartDate, filters.customEndDate]);

  // Enhanced country extraction function
  const extractCountry = (place) => {
    if (!place) return 'Unknown';
    
    // Split by comma and get the last part, then clean it up
    const parts = place.split(',');
    let country = parts[parts.length - 1]?.trim() || 'Unknown';
    
    // Handle common abbreviations and variations
    const countryMappings = {
      'CA': 'Canada',
      'US': 'United States',
      'MX': 'Mexico',
      'CL': 'Chile',
      'JP': 'Japan',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'NZ': 'New Zealand',
      'IT': 'Italy',
      'GR': 'Greece',
      'TR': 'Turkey',
      'Iran': 'Iran',
      'Papua New Guinea region': 'Papua New Guinea',
      'Kuril Islands': 'Russia',
      'Aleutian Islands': 'United States'
    };
    
    if (countryMappings[country]) {
      country = countryMappings[country];
    }
    
    return country;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enhanced data filtering
  const filteredData = useMemo(() => {
    return data.filter(eq => {
      const matchesMagnitude = eq.magnitude >= filters.minMagnitude && eq.magnitude <= filters.maxMagnitude;
      const matchesDepth = eq.depth >= filters.depthRange[0] && eq.depth <= filters.depthRange[1];
      const matchesCountry = filters.country === 'all' || 
                            eq.country.toLowerCase().includes(filters.country.toLowerCase()) ||
                            eq.place.toLowerCase().includes(filters.country.toLowerCase());
      
      return matchesMagnitude && matchesDepth && matchesCountry;
    });
  }, [data, filters]);

  // Get countries from actual data for the dropdown
  const availableCountries = useMemo(() => {
    const countrySet = new Set(data.map(eq => eq.country));
    return [...countrySet].sort();
  }, [data]);

  // Enhanced chart data
  const magnitudeDistribution = useMemo(() => {
    const ranges = [
      { name: 'Micro (0-2)', min: 0, max: 2, color: '#6b7280' },
      { name: 'Minor (2-3)', min: 2, max: 3, color: '#22c55e' },
      { name: 'Light (3-4)', min: 3, max: 4, color: '#eab308' },
      { name: 'Moderate (4-5)', min: 4, max: 5, color: '#f59e0b' },
      { name: 'Strong (5-6)', min: 5, max: 6, color: '#ef4444' },
      { name: 'Major (6+)', min: 6, max: 10, color: '#7c2d12' }
    ];
    
    return ranges.map(range => ({
      ...range,
      count: filteredData.filter(eq => eq.magnitude >= range.min && eq.magnitude < range.max).length
    }));
  }, [filteredData]);

  const depthData = useMemo(() => {
    return filteredData.map((eq, index) => ({
      index,
      depth: eq.depth,
      magnitude: eq.magnitude,
      place: eq.place.split(',')[0]
    }));
  }, [filteredData]);

  const timelineData = useMemo(() => {
    const sortedData = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
    return sortedData.slice(0, 100).map((eq, index) => ({
      index,
      magnitude: eq.magnitude,
      time: new Date(eq.timestamp).toLocaleDateString(),
      place: eq.place.split(',')[0]
    }));
  }, [filteredData]);

  const topCountries = useMemo(() => {
    const countryCounts = {};
    filteredData.forEach(eq => {
      countryCounts[eq.country] = (countryCounts[eq.country] || 0) + 1;
    });
    
    return Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([country, count]) => ({ country: country.length > 15 ? country.substring(0, 15) + '...' : country, count }));
  }, [filteredData]);

  const handleMarkerClick = useCallback((earthquake) => {
    setSelected(earthquake);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Globe },
    { id: 'map', name: 'Interactive Map', icon: Map },
    { id: 'charts', name: 'Analytics', icon: BarChart3 },
    { id: 'timeline', name: 'Timeline', icon: TrendingUp }
  ];

  const dateRange = getDateRange();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading earthquake data...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Fetching latest seismic activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Earthquake Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time global seismic activity monitoring
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {filteredData.length} earthquakes
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Enhanced Filters Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Magnitude Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Magnitude: {filters.minMagnitude} - {filters.maxMagnitude}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minMagnitude}
                  onChange={(e) => setFilters({...filters, minMagnitude: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.maxMagnitude}
                  onChange={(e) => setFilters({...filters, maxMagnitude: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>

            {/* Country Filter with comprehensive list */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Country/Region
              </label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Countries</option>
                <optgroup label="Available in Current Data">
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </optgroup>
                <optgroup label="All UN Member Countries">
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Time Range with Custom Date Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" />
                Time Range
              </label>
              <select
                value={filters.useCustomDate ? 'custom' : filters.timeRange}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setFilters({...filters, useCustomDate: true});
                  } else {
                    setFilters({...filters, timeRange: e.target.value, useCustomDate: false});
                  }
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="day">Past 24 Hours</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Inputs */}
            {filters.useCustomDate && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={(e) => setFilters({...filters, customStartDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={(e) => setFilters({...filters, customEndDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Depth Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Depth: {filters.depthRange[0]} - {filters.depthRange[1]} km
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.depthRange[0]}
                  onChange={(e) => setFilters({...filters, depthRange: [parseInt(e.target.value), filters.depthRange[1]]})}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.depthRange[1]}
                  onChange={(e) => setFilters({...filters, depthRange: [filters.depthRange[0], parseInt(e.target.value)]})}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{filteredData.length}</div>
                    <div className="text-blue-100">Total Earthquakes</div>
                  </div>
                  <Globe className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {filteredData.filter(eq => eq.magnitude >= 5).length}
                    </div>
                    <div className="text-red-100">Strong (5.0+)</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {filteredData.length > 0 ? Math.max(...filteredData.map(eq => eq.magnitude)).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-green-100">Highest Magnitude</div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {filteredData.length > 0 ? Math.round(filteredData.reduce((sum, eq) => sum + eq.depth, 0) / filteredData.length) : 0}
                    </div>
                    <div className="text-purple-100">Avg Depth (km)</div>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Enhanced Magnitude Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Magnitude Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={magnitudeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({name, count}) => count > 0 ? `${name}: ${count}` : ''}
                  >
                    {magnitudeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Top Countries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Most Active Regions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountries} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Recent Earthquakes List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredData.slice(0, 15).map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => setSelected(eq)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:shadow-md"
                  >
                    <div 
                      className={`w-4 h-4 rounded-full flex-shrink-0 shadow-lg ${
                        eq.magnitude >= 7 ? 'bg-red-900 animate-pulse' :
                        eq.magnitude >= 6 ? 'bg-red-500' : 
                        eq.magnitude >= 4 ? 'bg-yellow-500' : 
                        eq.magnitude >= 2 ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        M{eq.magnitude} - {eq.place}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {eq.time} • {eq.depth}km deep • {eq.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive Earthquake Map</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Click on markers to view details • {filteredData.length} earthquakes shown
                </p>
              </div>
              
              {/* Map Style Selector */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1"
                >
                  <option value="standard">Standard</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>
            </div>
            
            <div className="h-[75vh] w-full relative">
              {filteredData.length > 0 ? (
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  style={{ height: "100%", width: "100%" }}
                  maxZoom={18}
                  minZoom={2}
                  worldCopyJump={true}
                  key={`${filteredData.length}-${mapStyle}`}
                >
                  <EarthquakeMap 
                    data={filteredData} 
                    selected={selected} 
                    isDark={isDark}
                    onMarkerClick={handleMarkerClick}
                    mapStyle={mapStyle}
                  />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No earthquakes match the current filters</p>
                    <p className="text-sm mt-2">Try adjusting your filter criteria</p>
                  </div>
                </div>
              )}
            </div>
            
            {selected && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-6 h-6 rounded-full border-3 border-white shadow-lg mt-1 flex-shrink-0"
                    style={{ backgroundColor: selected.magnitude >= 7 ? '#7c2d12' : selected.magnitude >= 6 ? '#ef4444' : selected.magnitude >= 5 ? '#f59e0b' : selected.magnitude >= 4 ? '#eab308' : selected.magnitude >= 3 ? '#22c55e' : '#6b7280' }}
                  ></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      Magnitude {selected.magnitude} Earthquake
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
                      {selected.place}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <div>
                        <span className="font-medium">Depth:</span> {selected.depth} km
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {selected.time}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {selected.country}
                      </div>
                      <div>
                        <span className="font-medium">Coordinates:</span> {selected.coordinates[0].toFixed(3)}°, {selected.coordinates[1].toFixed(3)}°
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Depth vs Magnitude Scatter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Depth vs Magnitude Correlation
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="depth" name="Depth (km)" />
                  <YAxis dataKey="magnitude" name="Magnitude" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                            <p className="font-medium">{data.place}</p>
                            <p>Magnitude: {data.magnitude}</p>
                            <p>Depth: {data.depth} km</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="magnitude" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Magnitude Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Magnitude Categories
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={magnitudeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Country Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Geographic Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Earthquake Timeline - Magnitude Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                            <p className="font-medium">{data.place}</p>
                            <p>Date: {label}</p>
                            <p>Magnitude: {data.magnitude}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="magnitude" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {timelineData.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Events in Timeline</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {timelineData.length > 0 ? (timelineData.reduce((sum, eq) => sum + eq.magnitude, 0) / timelineData.length).toFixed(1) : '0.0'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Average Magnitude</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {timelineData.filter(eq => eq.magnitude >= 4).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Significant (4.0+)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
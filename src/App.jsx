import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from "recharts";
import { Moon, Sun, Map, BarChart3, Filter, Globe, Calendar, TrendingUp } from "lucide-react";
import L from "leaflet";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons based on magnitude
const createCustomIcon = (magnitude) => {
  const color = magnitude >= 6 ? '#ef4444' : magnitude >= 4 ? '#f59e0b' : magnitude >= 2 ? '#10b981' : '#6b7280';
  const size = Math.max(8, magnitude * 4);
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Map component with fly-to functionality
function EarthquakeMap({ data, selected, isDark }) {
  const map = useMap();
  
  useEffect(() => {
    if (selected && map) {
      map.flyTo(selected.coordinates, 8, { duration: 1.5 });
    }
  }, [selected, map]);

  return (
    <>
      <TileLayer
        url={isDark 
          ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
        attribution="&copy; OpenStreetMap contributors"
      />
      {data.map((eq) => (
        <Marker 
          key={eq.id} 
          position={eq.coordinates}
          icon={createCustomIcon(eq.magnitude)}
        >
          <Popup>
            <div className="text-sm min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${eq.magnitude >= 6 ? 'bg-red-500' : eq.magnitude >= 4 ? 'bg-yellow-500' : eq.magnitude >= 2 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <h3 className="font-bold">Magnitude {eq.magnitude}</h3>
              </div>
              <p className="font-medium mb-1">{eq.place}</p>
              <p className="text-gray-600">Depth: {eq.depth} km</p>
              <p className="text-gray-500 text-xs mt-2">{eq.time}</p>
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
  
  // Filters
  const [filters, setFilters] = useState({
    minMagnitude: 0,
    maxMagnitude: 10,
    country: 'all',
    timeRange: 'day',
    depthRange: [0, 1000]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoints = {
          day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
          week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
          month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
        };
        
        const response = await fetch(endpoints[filters.timeRange]);
        const result = await response.json();
        
        const earthquakes = result.features.map(f => ({
          id: f.id,
          place: f.properties.place || 'Unknown location',
          magnitude: f.properties.mag || 0,
          time: new Date(f.properties.time).toLocaleString(),
          timestamp: f.properties.time,
          depth: f.geometry.coordinates[2] || 0,
          coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
          country: (f.properties.place || '').split(',').pop()?.trim() || 'Unknown'
        }));
        
        setData(earthquakes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.timeRange]);

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return data.filter(eq => {
      return eq.magnitude >= filters.minMagnitude &&
             eq.magnitude <= filters.maxMagnitude &&
             eq.depth >= filters.depthRange[0] &&
             eq.depth <= filters.depthRange[1] &&
             (filters.country === 'all' || eq.country.toLowerCase().includes(filters.country.toLowerCase()));
    });
  }, [data, filters]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const countrySet = new Set(data.map(eq => eq.country));
    return [...countrySet].sort();
  }, [data]);

  // Chart data preparations
  const magnitudeDistribution = useMemo(() => {
    const ranges = [
      { name: 'Minor (0-3)', min: 0, max: 3, color: '#10b981' },
      { name: 'Light (3-4)', min: 3, max: 4, color: '#3b82f6' },
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
    return sortedData.slice(0, 50).map((eq, index) => ({
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
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  }, [filteredData]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Globe },
    { id: 'map', name: 'Interactive Map', icon: Map },
    { id: 'charts', name: 'Analytics', icon: BarChart3 },
    { id: 'timeline', name: 'Timeline', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Earthquake Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time global seismic activity
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredData.length} earthquakes found
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
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Magnitude Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Magnitude: {filters.minMagnitude} - {filters.maxMagnitude}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minMagnitude}
                  onChange={(e) => setFilters({...filters, minMagnitude: parseFloat(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.maxMagnitude}
                  onChange={(e) => setFilters({...filters, maxMagnitude: parseFloat(e.target.value)})}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country/Region
              </label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Regions</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="day">Past 24 Hours</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            {/* Depth Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Depth: {filters.depthRange[0]} - {filters.depthRange[1]} km
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.depthRange[0]}
                  onChange={(e) => setFilters({...filters, depthRange: [parseInt(e.target.value), filters.depthRange[1]]})}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.depthRange[1]}
                  onChange={(e) => setFilters({...filters, depthRange: [filters.depthRange[0], parseInt(e.target.value)]})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <div className="text-blue-100">Total Earthquakes</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold">
                  {filteredData.filter(eq => eq.magnitude >= 5).length}
                </div>
                <div className="text-red-100">Strong (5.0+)</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold">
                  {Math.max(...filteredData.map(eq => eq.magnitude)).toFixed(1)}
                </div>
                <div className="text-green-100">Highest Magnitude</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-2xl font-bold">
                  {Math.round(filteredData.reduce((sum, eq) => sum + eq.depth, 0) / filteredData.length) || 0}
                </div>
                <div className="text-purple-100">Avg Depth (km)</div>
              </div>
            </div>

            {/* Magnitude Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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

            {/* Top Countries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Most Active Regions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountries} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Earthquakes List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredData.slice(0, 10).map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => setSelected(eq)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      eq.magnitude >= 6 ? 'bg-red-500' : 
                      eq.magnitude >= 4 ? 'bg-yellow-500' : 
                      eq.magnitude >= 2 ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        M{eq.magnitude} - {eq.place}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {eq.time} • {eq.depth}km deep
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
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactive Earthquake Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Click on markers to view details • {filteredData.length} earthquakes shown
              </p>
            </div>
            <div className="h-[70vh] w-full">
              {filteredData.length > 0 ? (
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  style={{ height: "100%", width: "100%" }}
                  maxZoom={18}
                  minZoom={2}
                  worldCopyJump={true}
                  key={filteredData.length} // Force re-render when data changes
                >
                  <EarthquakeMap data={filteredData} selected={selected} isDark={isDark} />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No earthquakes match the current filters</p>
                    <p className="text-sm mt-2">Try adjusting your filter criteria</p>
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white mt-1 flex-shrink-0"
                    style={{ backgroundColor: selected.magnitude >= 7 ? '#7c2d12' : selected.magnitude >= 6 ? '#ef4444' : selected.magnitude >= 5 ? '#f59e0b' : selected.magnitude >= 4 ? '#eab308' : selected.magnitude >= 3 ? '#22c55e' : '#6b7280' }}
                  ></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Magnitude {selected.magnitude} Earthquake
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {selected.place}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>Depth: {selected.depth} km</span>
                      <span>Time: {selected.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Depth vs Magnitude Scatter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Depth vs Magnitude
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="depth" name="Depth (km)" />
                  <YAxis dataKey="magnitude" name="Magnitude" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter dataKey="magnitude" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Magnitude Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Magnitude Categories
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={magnitudeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Earthquake Timeline
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="magnitude" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
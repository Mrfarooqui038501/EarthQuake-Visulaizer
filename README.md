# 🌍 Earthquake Visualizer

An interactive **Earthquake Visualization Web Application** built with **React + Tailwind CSS + Leaflet**.

It fetches **real-time earthquake data** from the [USGS Earthquake API](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson) and presents it on an **interactive world map**, alongside powerful **data filters, charts, and insights**.

## ✨ Features

- ✅ **Real-time Earthquake Data** – Live feed from USGS API
- ✅ **Interactive Map** – View earthquakes across the globe with markers & popups
- ✅ **Multiple View Modes** – Switch between marker view and heatmap visualization
- ✅ **Advanced Filters** – Filter earthquakes by:
  - Magnitude range (dual sliders)
  - Time range (Past Day, Week, Month)
  - Country/Region (comprehensive worldwide list)
  - Depth range (earthquake depth filtering)
- ✅ **Rich Data Visualization** – Multiple chart types:
  - 📊 Bar Charts (Magnitude distribution, Regional activity)
  - 🥧 Pie Charts (Earthquake categories)
  - 📈 Line Charts (Timeline analysis)
  - 📉 Scatter Plots (Depth vs Magnitude correlation)
- ✅ **Tabbed Interface** – Organized sections:
  - Overview Dashboard
  - Interactive Map
  - Analytics Charts
  - Timeline View
- ✅ **Recent Earthquake List** – Click to zoom on the map
- ✅ **Dark Mode / Light Mode Toggle** 🌙☀️
- ✅ **Fully Responsive Design** – Optimized for desktop, tablet, and mobile
- ✅ **Real-time Statistics** – Live count of earthquakes and key metrics

## 🖼️ Application Sections

### 1. **Overview Dashboard**
- Key statistics cards (Total earthquakes, Strong earthquakes, Highest magnitude, Average depth)
- Magnitude distribution pie chart
- Most active regions bar chart
- Recent earthquake activity list

### 2. **Interactive Map**
- Color-coded earthquake markers based on magnitude
- Click-to-zoom functionality
- Detailed popup information
- Auto-fitting bounds for optimal view
- Theme-aware map tiles

### 3. **Analytics Charts**
- Depth vs Magnitude scatter plot
- Magnitude category distribution
- Regional activity comparison
- Statistical insights

### 4. **Timeline View**
- Earthquake frequency over time
- Magnitude trends
- Pattern analysis

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/) with Hooks
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps & Visualization**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Charts**: [Recharts](https://recharts.org/en-US/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [USGS Earthquake API](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson)

## 📂 Project Structure

```
earthquake-visualizer/
├── src/
│   ├── components/
│   │   ├── EarthquakeMap.jsx
│   │   ├── HeatmapLayer.jsx
│   │   ├── EarthquakeList.jsx
│   │   ├── EarthquakeChart.jsx
│   │   ├── Filters.jsx
│   │   └── SafetyTips.jsx
│   ├── App.jsx
│   └── index.js
├── public/
│   ├── index.html
│   └── favicon.ico
├── package.json
└── README.md
```

## ⚡ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/mr.farooqui038501/earthquake-visualizer.git
cd earthquake-visualizer
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Start the development server
```bash
npm run dev
```

### 4️⃣ Build for production
```bash
npm run build
```

### 5️⃣ Preview production build
```bash
npm run preview
```

## 🔗 API Reference

We use the **USGS Earthquake API** for real-time data:

```
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```

### Available Data Feeds:
- **Past Day**: `/all_day.geojson`
- **Past Week**: `/all_week.geojson`
- **Past Month**: `/all_month.geojson`

### Data Structure:
Each earthquake contains:
- **Magnitude**: Richter scale measurement
- **Location**: Geographic coordinates and place name
- **Depth**: Kilometers below surface
- **Time**: UTC timestamp
- **Country/Region**: Parsed from location string

## 🌗 Theme Support

The application features a comprehensive dark/light mode toggle:
- **Automatic theme detection** based on system preferences
- **Manual toggle** with smooth transitions
- **Theme-aware map tiles** for optimal visibility
- **Persistent theme selection** across sessions

## 📊 Data Insights & Visualizations

### Statistical Analysis:
- **Real-time Metrics**: Total count, strong earthquakes (5.0+), highest magnitude, average depth
- **Distribution Analysis**: Earthquake categories (Minor, Light, Moderate, Strong, Major)
- **Geographic Patterns**: Most active regions and countries
- **Temporal Trends**: Timeline analysis and frequency patterns

### Chart Types:
1. **Pie Charts**: Magnitude distribution and earthquake categories
2. **Bar Charts**: Regional activity and magnitude comparisons
3. **Line Charts**: Timeline trends and temporal patterns
4. **Scatter Plots**: Depth vs magnitude correlation analysis

## 🚀 Performance Features

- **Optimized Rendering**: UseMemo hooks for expensive calculations
- **Lazy Loading**: Efficient data processing and filtering
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Interactive Elements**: Smooth animations and transitions
- **Error Handling**: Robust data fetching with loading states

## 🎯 Filter Capabilities

### Advanced Filtering Options:
- **Magnitude Range**: Dual-slider for precise range selection (0-10)
- **Time Range**: Past day, week, or month data
- **Geographic Filter**: Comprehensive worldwide country list
- **Depth Filter**: Earthquake depth range (0-1000km)
- **Real-time Results**: Live filtering with result counts

## 🤝 Contributing

Contributions are welcome! 🚀

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines:
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling consistency
- Ensure responsive design across all screen sizes
- Add proper error handling and loading states
- Write clear, commented code

## 📋 Requirements

### System Requirements:
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Modern Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

### Dependencies:
- React 18+
- Tailwind CSS 3+
- Leaflet 1.7+
- Recharts 2.5+
- Lucide React 0.263+

## 🔧 Configuration

### Environment Variables:
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/
REACT_APP_MAP_ATTRIBUTION=© OpenStreetMap contributors
```

### Customization Options:
- **API Endpoints**: Modify data sources in the fetch functions
- **Map Themes**: Add custom map tile providers
- **Color Schemes**: Customize magnitude color coding
- **Chart Styling**: Modify Recharts theme and colors

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Arman Farooqui

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

**Arman Farooqui**
- GitHub: [@mrfarooqui038501](https://github.com/mrfarooqui038501)
- Email: armanfarooqui078601@gmail.com

---

### 🙏 Acknowledgments

- **USGS**: For providing free earthquake data API
- **OpenStreetMap**: For map tiles and geographic data
- **React Community**: For excellent documentation and ecosystem
- **Tailwind CSS**: For the utility-first CSS framework

---

**Built with ❤️ for earthquake awareness and preparedness**#   E a r t h Q u a k e - V i s u l a i z e r  
 
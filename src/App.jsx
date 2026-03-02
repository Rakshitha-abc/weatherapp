import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Wind,
  Droplets,
  Sun,
  Search,
  Calendar,
  History,
  Ship,
  MapPin,
  Navigation,
  Thermometer,
  CloudRain,
  Compass,
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { weatherApi } from './api';
import './index.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('New York');
  const [units, setUnits] = useState('m'); // 'm' for metric, 's' for scientific, 'f' for fahrenheit
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [marineData, setMarineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState(['New York', 'London', 'Tokyo']);

  const fetchData = async (loc, unit = units) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getCurrent(loc, unit);
      setWeatherData(data);
      setLocation(data.location.name);
      setUnits(unit);

      // Auto-fetch forecast if standard plan supports it
      // For this demo, we'll try to fetch but handle fails gracefully
      // if (activeTab === 'forecast') {
      //   const fData = await weatherApi.getForecast(loc);
      //   setForecastData(fData);
      // }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getInitialLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = `${position.coords.latitude},${position.coords.longitude}`;
            fetchData(loc);
          },
          () => fetchData(location)
        );
      } else {
        fetchData(location);
      }
    };
    getInitialLocation();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchData(query);
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      }
      setQuery('');
    }
  };

  const navItems = [
    { id: 'current', label: 'Current View', icon: <Sun size={20} /> },
    { id: 'forecast', label: 'Forecast', icon: <Calendar size={20} /> },
    { id: 'historical', label: 'Historical', icon: <History size={20} /> },
    { id: 'marine', label: 'Marine Data', icon: <Ship size={20} /> },
    { id: 'location', label: 'Locations', icon: <MapPin size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1>SkyCast</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Premium Weather SaaS</p>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>QUICK FILTERS</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['m', 's', 'f'].map(u => (
              <span
                key={u}
                className={`badge ${units === u ? 'badge-cyan' : ''}`}
                style={{
                  cursor: 'pointer',
                  opacity: units === u ? 1 : 0.6,
                  border: units === u ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                }}
                onClick={() => fetchData(location, u)}
              >
                {u.toUpperCase()} Units
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search city, coordinates, or IP..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.875rem' }}>{location}</span>
              </div>
              <div style={{ width: '1px', height: '1.5rem', background: 'var(--glass-border)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="loader">Loading intelligence...</div>
            </motion.div>
          ) : error ? (
            <motion.div
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}
            >
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <X size={48} />
                <h3>API Error</h3>
                <p>{error}</p>
                <button onClick={() => fetchData(location)} className="nav-item active" style={{ marginTop: '1rem', marginInline: 'auto' }}>Retry</button>
              </div>
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {activeTab === 'current' && (
                <>
                  {/* Top Row: Main Status */}
                  <div className="weather-grid">
                    <div className="glass-card main-weather-card">
                      <div className="location-info">
                        <span className="badge badge-purple">LIVE ANALYSIS</span>
                        <h2>{weatherData.location.name}</h2>
                        <p>{weatherData.location.region}, {weatherData.location.country}</p>
                        <div className="temp-large">
                          {weatherData.current.temperature}°
                          <span style={{ fontSize: '2rem', marginLeft: '-0.5rem' }}>
                            {units === 'm' ? 'C' : units === 's' ? 'K' : 'F'}
                          </span>
                        </div>
                        <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{weatherData.current.weather_descriptions[0]}</p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <img
                          src={weatherData.current.weather_icons[0]}
                          alt="Weather Icon"
                          style={{ width: '80px', height: '80px', borderRadius: '20px', boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}
                        />
                        <div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Visibility</p>
                          <h4 style={{ fontSize: '1.25rem' }}>{weatherData.current.visibility} {units === 's' ? 'km' : units === 'm' ? 'km' : 'mi'}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600 }}>Atmospheric Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '10px' }}>
                              <Droplets size={18} color="var(--accent-cyan)" />
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>Humidity</span>
                          </div>
                          <span style={{ fontWeight: 600 }}>{weatherData.current.humidity}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px' }}>
                              <Wind size={18} color="var(--accent-soft-purple)" />
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>Wind Speed</span>
                          </div>
                          <span style={{ fontWeight: 600 }}>{weatherData.current.wind_speed} {units === 'm' ? 'km/h' : units === 's' ? 'km/h' : 'mph'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '10px' }}>
                              <Thermometer size={18} color="var(--accent-rose)" />
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>Feels Like</span>
                          </div>
                          <span style={{ fontWeight: 600 }}>{weatherData.current.feelslike}°{units === 'm' ? 'C' : units === 's' ? 'K' : 'F'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights / Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>SaaS Intelligence</h3>
                        <ArrowUpRight size={18} color="var(--text-dim)" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>UV INDEX</p>
                          <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{weatherData.current.uv_index}</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PRESSURE</p>
                          <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{weatherData.current.pressure} mb</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>CLOUD COVER</p>
                          <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{weatherData.current.cloudcover}%</p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PRECIP</p>
                          <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{weatherData.current.precip} mm</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card">
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Location Parameters</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Latitude</span>
                          <span>{weatherData.location.lat}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Longitude</span>
                          <span>{weatherData.location.lon}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Local Date</span>
                          <span>{weatherData.location.localtime.split(' ')[0]}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Timezone</span>
                          <span>{weatherData.location.timezone_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(activeTab === 'forecast' || activeTab === 'historical' || activeTab === 'marine') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '24px', marginBottom: '2rem' }}>
                      {activeTab === 'forecast' && <Calendar size={48} color="var(--accent-soft-purple)" />}
                      {activeTab === 'historical' && <History size={48} color="var(--accent-soft-purple)" />}
                      {activeTab === 'marine' && <Ship size={48} color="var(--accent-soft-purple)" />}
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Premium SaaS Dataset</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginInline: 'auto' }}>
                      Access to {activeTab} data requires the <strong>Standard Plan</strong> or higher.
                      Your current API configuration includes high-fidelity real-time streams only.
                    </p>
                    <button className="nav-item active" style={{ marginTop: '2rem', marginInline: 'auto', paddingInline: '2rem' }}>
                      Upgrade Intelligence Plan
                    </button>
                  </div>

                  {activeTab === 'forecast' && (
                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card" style={{ opacity: 0.5 }}>
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Day {i + 1}</p>
                          <h4 style={{ fontSize: '1.5rem' }}>--°</h4>
                          <p style={{ fontSize: '0.75rem' }}>Prediction Pending</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Recently Analyzed Locations</h3>
                  <div className="forecast-list">
                    {searchHistory.map((loc, i) => (
                      <div key={i} className="forecast-item" onClick={() => fetchData(loc)} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <MapPin size={18} color="var(--accent-cyan)" />
                          <span>{loc}</span>
                        </div>
                        <ArrowUpRight size={14} color="var(--text-dim)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <footer style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', padding: '1rem' }}>
          &copy; 2026 SkyCast Intelligence Systems. All endpoints active.
        </footer>
      </main>

      <style>{`
        .loader {
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid var(--accent-cyan);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;

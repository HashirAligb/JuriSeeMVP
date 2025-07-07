import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://127.0.0.1:5000/api/violations');
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        setData(json.violations);
        setFilteredData(json.violations);
      } catch (err) {
        setError('Failed to load data. Make sure the Flask backend is running on port 5000.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBorough === 'All') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((item) => item.borough === selectedBorough));
    }
  }, [selectedBorough, data]);

  const boroughs = ['All', ...Array.from(new Set(data.map((item) => item.borough)))]

  const chartData = {
    labels: filteredData.map((item) => item.law_firm),
    datasets: [
      {
        label: 'Number of Violations',
        data: filteredData.map((item) => item.violations),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Legal Violations by Law Firm${selectedBorough !== 'All' ? ` - ${selectedBorough}` : ''}`,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-logo">J</div>
          <div>
            <h1 className="dashboard-title">JuriSee Dashboard</h1>
            <p className="dashboard-subtitle">NYC Legal Violations Monitoring System</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-card">
          <div className="dashboard-controls">
            <div className="dashboard-filter">
              <label htmlFor="borough-select">Filter by Borough:</label>
              <select
                id="borough-select"
                value={selectedBorough}
                onChange={(e) => setSelectedBorough(e.target.value)}
              >
                {boroughs.map((borough) => (
                  <option key={borough} value={borough}>
                    {borough}
                  </option>
                ))}
              </select>
            </div>
            <div className="dashboard-count">Showing {filteredData.length} law firms</div>
          </div>

          <div className="dashboard-chart-container">
            {loading ? (
              <div className="dashboard-loading">Loading violations data...</div>
            ) : error ? (
              <div className="dashboard-error">
                <div>⚠️ Error Loading Data</div>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="dashboard-retry">Retry</button>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="dashboard-nodata">No data available for {selectedBorough}</div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          {!loading && !error && filteredData.length > 0 && (
            <div className="dashboard-stats">
              <div className="dashboard-stat dashboard-stat-blue">
                <div className="dashboard-stat-value">{filteredData.length}</div>
                <div className="dashboard-stat-label">Law Firms</div>
              </div>
              <div className="dashboard-stat dashboard-stat-red">
                <div className="dashboard-stat-value">
                  {filteredData.reduce((sum, item) => sum + item.violations, 0)}
                </div>
                <div className="dashboard-stat-label">Total Violations</div>
              </div>
              <div className="dashboard-stat dashboard-stat-orange">
                <div className="dashboard-stat-value">
                  {Math.round(
                    (filteredData.reduce((sum, item) => sum + item.violations, 0) / filteredData.length) * 10,
                  ) / 10}
                </div>
                <div className="dashboard-stat-label">Avg per Firm</div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© 2024 JuriSee Legal Violations Dashboard - MVP Demo</p>
      </footer>
    </div>
  );
} 
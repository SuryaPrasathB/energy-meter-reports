import React, { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import './Home.css';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [serial, setSerial] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchMode, setSearchMode] = useState('serial');


  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (searchMode === 'serial' && !serial.trim()) {
      alert('Please enter a meter serial number.');
      return;
    }
    if (searchMode === 'date' && (!startDate || !endDate)) {
      alert('Please select both start and end dates.');
      return;
    }


    try {
      const params = new URLSearchParams();
      if (serial.trim()) params.append('serial', serial.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`http://192.168.0.104:8080/api/reports/search?${params.toString()}`);
      const data = await response.json();

      if (data.available && data.files.length > 0) {
        setDownloadLinks(data.files);
        setSelectedFiles(new Set(data.files)); // Select all by default
      } else {
        setDownloadLinks([]);
        setSelectedFiles(new Set());
        alert('No reports found for the given input.');
      }
    } catch (error) {
      console.error('Error checking reports:', error);
      alert('Server error. Please try again later.');
    }
  };

  const toggleFileSelection = (filepath) => {
    setSelectedFiles(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(filepath)) {
        newSelected.delete(filepath);
      } else {
        newSelected.add(filepath);
      }
      return newSelected;
    });
  };

  const handleZipDownload = async () => {
    if (selectedFiles.size === 0) {
      alert('Please select at least one report to download.');
      return;
    }

    try {
      const zipParams = new URLSearchParams();
      selectedFiles.forEach(file => zipParams.append('files', file));

      const zipUrl = `http://192.168.0.104:8080/api/reports/download-zip?${zipParams.toString()}`;
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = 'reports.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      alert('Failed to download ZIP file.');
    }
  };

  return (
    <div className="home-container">
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? '🌙' : '☀️'}
      </button>

      <h1>Energy Meter Reports</h1>

      <div className="content-wrapper">
        <section className="search-section">
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="search-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${searchMode === 'serial' ? 'active' : ''}`}
                onClick={() => setSearchMode('serial')}
              >
                🔍 Serial No.
              </button>
              <button
                type="button"
                className={`mode-btn ${searchMode === 'date' ? 'active' : ''}`}
                onClick={() => setSearchMode('date')}
              >
                📅 Date Range
              </button>
            </div>

            {searchMode === 'serial' && (
              <>
                <label htmlFor="serialNumbers" className="label">
                  Meter Serial Number:
                </label>
                <input
                  id="serialNumbers"
                  type="text"
                  placeholder="Enter Serial Number"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className="input"
                />
              </>
            )}

            {searchMode === 'date' && (
              <>
                <label htmlFor="startDate" className="label">
                  Start Date:
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />

                <label htmlFor="endDate" className="label">
                  End Date:
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </>
            )}

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>

        </section>

        <section className="results-section">
          {downloadLinks.length > 0 ? (
            <>
              <h3>Available Reports:</h3>
              <ul className="reports-list">
                {downloadLinks.map((filepath) => {
                  const [date, file] = filepath.split('/');
                  const isChecked = selectedFiles.has(filepath);

                  return (
                    <li key={filepath} className="report-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFileSelection(filepath)}
                          className="checkbox"
                        />
                        <a
                          href={`http://192.168.0.104:8080/api/reports/download/${date}/${file}`}
                          download
                          className="download-link"
                          onClick={(e) => e.stopPropagation()} // prevent checkbox toggle when clicking link
                        >
                          📄 {filepath}
                        </a>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={handleZipDownload}
                className="zip-download-btn"
                disabled={selectedFiles.size === 0}
                style={{ cursor: selectedFiles.size === 0 ? 'not-allowed' : 'pointer' }}
              >
                📁 Download Selected as ZIP
              </button>
            </>
          ) : (
            <p className="no-results-text">Search reports to see results here.</p>
          )}
        </section>
      </div>
    </div>
  );
}

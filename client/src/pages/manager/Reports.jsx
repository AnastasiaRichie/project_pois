import React, { useState, useEffect } from 'react';
import { getZones } from '../../api/zones';
import { generateReport } from '../../api/reports';

const TIME_SLOTS = ['06:00-10:00', '10:00-14:00', '14:00-18:00', '18:00-22:00'];

export default function Reports() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [docUrl, setDocUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getZones().then(res => setZones(res.data));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setDocUrl('');
    setReportData(null);
    setLoading(true);

    try {
      const res = await generateReport({ zoneId, startDate, endDate });
      setReportData(res.data.data);
      setDocUrl(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Report generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Reports</h1>
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleGenerate}>
        <label>Zone</label>
        <select value={zoneId} onChange={e => setZoneId(e.target.value)} required>
          <option value="">Select zone</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>

        <div className="form-row">
          <div>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 15 }} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {docUrl && (
        <div className="message success" style={{ marginTop: 15 }}>
          Report created: <a href={docUrl} target="_blank" rel="noreferrer">{docUrl}</a>
        </div>
      )}

      {reportData && (
        <table style={{ marginTop: 15 }}>
          <thead>
            <tr>
              <th rowSpan={2}>Date</th>
              {TIME_SLOTS.map(s => <th key={s} colSpan={3}>{s}</th>)}
            </tr>
            <tr>
              {TIME_SLOTS.map(s => (
                <React.Fragment key={s}>
                  <th>min</th><th>avg</th><th>max</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map(row => (
              <tr key={row.date}>
                <td>{row.date}</td>
                {row.slots.map((s, i) => (
                  <React.Fragment key={i}>
                    <td>{s.min}</td><td>{s.avg}</td><td>{s.max}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

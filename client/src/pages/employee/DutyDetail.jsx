import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDuties } from '../../api/duties';
import { getRecords, syncRecords } from '../../api/records';
import ZoneMap from '../../components/ZoneMap';
import { getZones } from '../../api/zones';

export default function DutyDetail() {
  const { id } = useParams();
  const [duty, setDuty] = useState(null);
  const [records, setRecords] = useState([]);
  const [zones, setZones] = useState([]);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    getDuties().then(res => {
      const found = res.data.find(d => d.id === Number(id));
      setDuty(found);
    });
    getRecords(id).then(res => setRecords(res.data));
    getZones().then(res => setZones(res.data));
  }, [id]);

  async function handleSync() {
    setSyncMsg('');
    try {
      const res = await syncRecords(id);
      setSyncMsg(res.data.message);
      getRecords(id).then(r => setRecords(r.data));
    } catch (err) {
      setSyncMsg(err.response?.data?.error || 'Sync failed');
    }
  }

  if (!duty) return <p>Loading...</p>;

  const formUrl = import.meta.env.VITE_GOOGLE_FORM_URL;

  return (
    <div>
      <h1>Duty: {duty.date}</h1>
      <p><strong>Zone:</strong> {duty.zone_name}</p>
      <p><strong>Time:</strong> {duty.start_time} - {duty.end_time}</p>
      <p><strong>Status:</strong> <span className={`badge ${duty.status}`}>{duty.status}</span></p>

      <ZoneMap zones={zones.filter(z => z.id === duty.zone_id)} />

      {formUrl && (
        <a
          href={`${formUrl}?entry.0=${duty.id}`}
          target="_blank"
          rel="noreferrer"
          className="google-btn"
          style={{ display: 'inline-block', marginTop: 10 }}
        >
          Open Google Form to Record Vehicle
        </a>
      )}

      <div style={{ marginTop: 15 }}>
        <button className="btn-primary" onClick={handleSync}>Sync Records from Google Sheet</button>
        {syncMsg && <span style={{ marginLeft: 10 }}>{syncMsg}</span>}
      </div>

      <h2 style={{ marginTop: 20 }}>Vehicle Records</h2>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>License Plate</th><th>Car Brand</th><th>Parked At</th><th>Departed At</th></tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.license_plate}</td>
                <td>{r.car_brand}</td>
                <td>{r.parked_at}</td>
                <td>{r.departed_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDuties } from '../../api/duties';

export default function MyDuties() {
  const [duties, setDuties] = useState([]);

  useEffect(() => {
    getDuties().then(res => setDuties(res.data));
  }, []);

  return (
    <div>
      <h1>My Duties</h1>
      {duties.length === 0 ? (
        <p>No duties assigned yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Date</th><th>Time</th><th>Zone</th><th>Status</th><th>Details</th></tr>
          </thead>
          <tbody>
            {duties.map(d => (
              <tr key={d.id}>
                <td>{d.date}</td>
                <td>{d.start_time} - {d.end_time}</td>
                <td>{d.zone_name}</td>
                <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                <td><Link to={`/employee/duties/${d.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

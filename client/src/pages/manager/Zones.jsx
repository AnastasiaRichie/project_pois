import { useState, useEffect } from 'react';
import { getZones, createZone, deleteZone } from '../../api/zones';
import ZoneMap from '../../components/ZoneMap';
import ZoneEditor from '../../components/ZoneEditor';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [polygon, setPolygon] = useState(null);

  function load() {
    getZones().then(res => setZones(res.data));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!polygon) return alert('Draw a polygon on the map');
    await createZone({ name, description, polygon });
    setName('');
    setDescription('');
    setPolygon(null);
    setShowEditor(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this zone?')) return;
    await deleteZone(id);
    load();
  }

  return (
    <div>
      <h1>Parking Zones</h1>

      <ZoneMap zones={zones} />

      <button className="btn-primary" onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? 'Cancel' : 'Add Zone'}
      </button>

      {showEditor && (
        <form onSubmit={handleCreate}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          <label>Draw polygon on the map below:</label>
          <ZoneEditor onPolygonCreated={setPolygon} />
          {polygon && <p className="message success">Polygon captured</p>}
          <button type="submit" className="btn-success" style={{ marginTop: 10 }}>Save Zone</button>
        </form>
      )}

      <table>
        <thead>
          <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {zones.map(z => (
            <tr key={z.id}>
              <td>{z.name}</td>
              <td>{z.description}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDelete(z.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

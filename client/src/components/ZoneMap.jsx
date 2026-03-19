import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [55.751244, 37.618423];
const DEFAULT_ZOOM = 12;

export default function ZoneMap({ zones = [] }) {
  const center = zones.length > 0
    ? getPolygonCenter(zones[0].polygon)
    : DEFAULT_CENTER;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map(zone => {
          const positions = parsePolygon(zone.polygon);
          if (!positions) return null;
          return (
            <Polygon key={zone.id} positions={positions} pathOptions={{ color: '#2c3e50' }}>
              <Tooltip permanent>{zone.name}</Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}

function parsePolygon(polygon) {
  try {
    const data = typeof polygon === 'string' ? JSON.parse(polygon) : polygon;
    return data;
  } catch {
    return null;
  }
}

function getPolygonCenter(polygon) {
  const positions = parsePolygon(polygon);
  if (!positions || positions.length === 0) return DEFAULT_CENTER;
  const flat = Array.isArray(positions[0]?.[0]) ? positions[0] : positions;
  const lat = flat.reduce((s, p) => s + p[0], 0) / flat.length;
  const lng = flat.reduce((s, p) => s + p[1], 0) / flat.length;
  return [lat, lng];
}

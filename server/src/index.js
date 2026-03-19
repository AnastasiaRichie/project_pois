import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import zonesRoutes from './routes/zones.js';
import dutiesRoutes from './routes/duties.js';
import recordsRoutes from './routes/records.js';
import reportsRoutes from './routes/reports.js';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/duties', dutiesRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/reports', reportsRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

import express from 'express';
import cors from 'cors';
import { config } from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.PORT, () => {
  console.log(`Mock server running on http://localhost:${config.PORT}`);
  console.log(`Access token lifetime: ${config.ACCESS_TOKEN_LIFETIME}s`);
  console.log(`Refresh token lifetime: ${config.REFRESH_TOKEN_LIFETIME}s`);
});

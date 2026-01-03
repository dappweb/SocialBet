import { serve } from '@hono/node-server';
import app from './index-local';

const port = 8787;

console.log(`🚀 Starting local development server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
  console.log(`📊 Mock data loaded - Markets and Users APIs available`);
});
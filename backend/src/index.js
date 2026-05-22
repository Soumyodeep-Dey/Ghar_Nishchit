// dotenv MUST be the very first import in ES Modules.
// Using `import 'dotenv/config'` ensures .env is loaded before
// any other module (including payment.controller.js) is evaluated.
import 'dotenv/config';

// Validate critical environment variables at startup
const REQUIRED_ENV = ['MONGODB_URI', 'NEONDB_URL', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((envVar) => !process.env[envVar]);
if (missingEnv.length > 0) {
  console.error(`\x1b[31m[FATAL] Missing required environment variables: ${missingEnv.join(', ')}\x1b[0m`);
  process.exit(1);
}

import { connectDB } from './db/index.js';
import { app } from './app.js';
import { startOutboxWorker } from './utils/outboxWorker.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Boot background transactional outbox sync worker
      startOutboxWorker();
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB and start server', err);
    process.exit(1);
  });

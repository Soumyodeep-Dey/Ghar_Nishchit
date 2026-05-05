// dotenv MUST be the very first import in ES Modules.
// Using `import 'dotenv/config'` ensures .env is loaded before
// any other module (including payment.controller.js) is evaluated.
import 'dotenv/config';

import { connectDB } from './db/index.js';
import { app } from './app.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB and start server', err);
    process.exit(1);
  });

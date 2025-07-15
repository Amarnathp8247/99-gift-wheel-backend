import app from './app.js';
import connectDB from './config/db.js';
import { PORT } from './config/env.js';

// Connect to MongoDB then start the server
(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})();

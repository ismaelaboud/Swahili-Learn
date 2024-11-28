import app from './app';
import logger from './utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware: requests ke beech chalne wale handlers
const logger = require('./middleware/logger');
app.use(logger);
app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

// Routes: endpoint modules mount kar raha hai
const commentRoutes = require('./routes/comments');
const mlRoutes = require('./routes/ml');
const documentsRoutes = require('./routes/documents');

app.use('/api', commentRoutes);
app.use('/ml', mlRoutes);
app.use('/api', documentsRoutes);

// Health check endpoint: server status batata hai
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Centralized error handler: sab errors yahin handle honge
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5046;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected (Neon PostgreSQL)' : 'Not configured'}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});


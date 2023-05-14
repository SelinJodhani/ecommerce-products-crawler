import { connect } from 'mongoose';
import http from 'http';

import app from './app.js';

const server = http.Server(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  connect(process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/mydatabase');
  console.log(`Server is listening to PORT: ${PORT}`);
});

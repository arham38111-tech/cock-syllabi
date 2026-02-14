const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠ MongoDB Connection Warning: ${error.message}`);
    console.warn(`
╔════════════════════════════════════════════════════════════════╗
║  MongoDB Not Connected - Try these solutions:                  ║
║                                                                 ║
║  1. Install MongoDB Community Server:                          ║
║     Download from: https://www.mongodb.com/try/download/community
║     Then restart this server                                   ║
║                                                                 ║
║  2. Use MongoDB Atlas (Cloud) instead:                         ║
║     - Create a free account at https://www.mongodb.com/cloud   ║
║     - Update MONGO_URI in .env file                            ║
║     Example: mongodb+srv://user:pass@cluster.mongodb.net/db    ║
║                                                                 ║
║  3. For now, the server will run but API calls will fail       ║
║     until MongoDB is connected.                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
    // Don't exit - allow server to run in case DB comes online later
  }
};

module.exports = connectDB;

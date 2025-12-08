require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginLandingPageLocalDefault } = require("@apollo/server/plugin/landingPage/default");

const { typeDefs, resolvers } = require("./graphql/schema");
const sequelize = require("./db/sequelize");
const { authContext } = require("./utils/auth");
const { ensureIndex } = require('./utils/search');
const { startDeviceSyncScheduler } = require('./utils/deviceSync');

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: corsOrigins.length ? corsOrigins : true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(json());

async function start() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });

  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => authContext(req),
    })
  );

  const port = process.env.PORT || 4000;
  app.listen(port, async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ DB Connected");
    } catch (err) {
      console.error("❌ DB Error:", err);
    }
    try {
      await ensureIndex('users');
      console.log('🔎 Elasticsearch index ready');
    } catch (e) {
      console.warn('⚠️ Elasticsearch not reachable or index ensure failed');
    }
    
    // Start device sync scheduler
    startDeviceSyncScheduler(5); // Sync every 5 minutes
    
    // Start machine metrics scheduler
    const { startMachineMetricsScheduler, generateTestMachineMetrics } = require('./utils/machineMetricsCalculator');
    
    // Generate test data on startup (for development)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        generateTestMachineMetrics();
      }, 5000); // Wait 5 seconds after startup
    }
    
    startMachineMetricsScheduler(); // Calculate metrics every minute
    
    console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
  });
}

start();

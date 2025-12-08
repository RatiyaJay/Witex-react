import { configureStore } from "@reduxjs/toolkit";

// Simple store without the problematic GraphQL API for now
const store = configureStore({
  reducer: {
    // Add reducers here as needed
    app: (state = { initialized: true }, action) => state,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
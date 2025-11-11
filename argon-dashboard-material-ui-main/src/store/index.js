import { configureStore } from "@reduxjs/toolkit";
import { graphqlApi } from "services/graphqlApi";
import firmsReducer from "store/slices/firmsSlice";
import yarnsReducer from "store/slices/yarnsSlice";
import beamsReducer from "store/slices/beamsSlice";

const store = configureStore({
  reducer: {
    [graphqlApi.reducerPath]: graphqlApi.reducer,
    firms: firmsReducer,
    yarns: yarnsReducer,
    beams: beamsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(graphqlApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
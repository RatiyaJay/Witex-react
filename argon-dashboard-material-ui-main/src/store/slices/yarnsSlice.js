import { createSlice } from "@reduxjs/toolkit";
import { graphqlApi } from "services/graphqlApi";

const initialState = {
  selectedFirmId: null,
  status: "idle",
  error: null,
};

const yarnsSlice = createSlice({
  name: "yarns",
  initialState,
  reducers: {
    setSelectedFirmId(state, action) {
      state.selectedFirmId = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setSelectedFirmId, setStatus, setError } = yarnsSlice.actions;

export const loadYarns = (firmId) => async (dispatch) => {
  dispatch(setSelectedFirmId(firmId));
  dispatch(setStatus("loading"));
  const subscription = await dispatch(
    graphqlApi.endpoints.getYarns.initiate(firmId)
  );
  try {
    if (subscription?.error) {
      dispatch(setError(subscription.error));
      dispatch(setStatus("failed"));
    } else {
      dispatch(setStatus("succeeded"));
    }
    return subscription;
  } finally {
    subscription?.unsubscribe?.();
  }
};

export default yarnsSlice.reducer;
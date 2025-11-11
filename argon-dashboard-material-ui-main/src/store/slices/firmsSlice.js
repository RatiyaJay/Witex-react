import { createSlice } from "@reduxjs/toolkit";
import { graphqlApi } from "services/graphqlApi";

const initialState = {
  selectedFirmId: null,
  status: "idle",
  error: null,
};

const firmsSlice = createSlice({
  name: "firms",
  initialState,
  reducers: {
    selectFirm(state, action) {
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

export const { selectFirm, setStatus, setError } = firmsSlice.actions;

// Thunk: programmatically call GraphQL query via RTK Query
export const loadFirms = () => async (dispatch) => {
  dispatch(setStatus("loading"));
  const subscription = await dispatch(graphqlApi.endpoints.getFirms.initiate());
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

export default firmsSlice.reducer;
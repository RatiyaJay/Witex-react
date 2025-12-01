import { createSlice } from "@reduxjs/toolkit";
import { graphqlApi } from "services/graphqlApi";

const initialState = {
  statusFilter: null,
  status: "idle",
  error: null,
};

const beamsSlice = createSlice({
  name: "beams",
  initialState,
  reducers: {
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setStatusFilter, setStatus, setError } = beamsSlice.actions;

export const loadBeams = (status) => async (dispatch) => {
  dispatch(setStatusFilter(status));
  dispatch(setStatus("loading"));
  const subscription = await dispatch(
    graphqlApi.endpoints.getBeams.initiate(status)
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

export const updateBeamStatusThunk = ({ id, status }) => async (dispatch) => {
  const subscription = await dispatch(
    graphqlApi.endpoints.updateBeamStatus.initiate({ id, status })
  );
  try {
    if (subscription?.error) {
      dispatch(setError(subscription.error));
    }
    return subscription;
  } finally {
    subscription?.unsubscribe?.();
  }
};

export default beamsSlice.reducer;
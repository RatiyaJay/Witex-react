import { createApi } from "@reduxjs/toolkit/query/react";
import { GET_FIRMS } from "../graphql/firms/queries";
import { ADD_FIRM } from "../graphql/firms/mutations";
import { GET_YARNS } from "../graphql/yarns/queries";
import { ADD_YARN } from "../graphql/yarns/mutations";
import { GET_BEAMS } from "../graphql/beams/queries";
import { UPDATE_BEAM_STATUS } from "../graphql/beams/mutations";

// Minimal GraphQL baseQuery using fetch. Expects a GraphQL endpoint.
const graphqlBaseQuery = ({ baseUrl }) => async ({ document, variables, headers }) => {
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: JSON.stringify({ query: document, variables }),
    });

    const json = await res.json();
    if (json.errors) {
      return { error: json.errors };
    }
    return { data: json.data };
  } catch (e) {
    return { error: e };
  }
};

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "/graphql";

export const graphqlApi = createApi({
  reducerPath: "graphqlApi",
  baseQuery: graphqlBaseQuery({ baseUrl: GRAPHQL_URL }),
  tagTypes: ["Firms", "Yarns", "Beams"],
  endpoints: (builder) => ({
    // Example queries — adjust fields to match your server schema
    getFirms: builder.query({
      query: () => ({ document: GET_FIRMS }),
      providesTags: (result) =>
        result?.firms
          ? [
              ...result.firms.map((f) => ({ type: "Firms", id: f.id })),
              { type: "Firms", id: "LIST" },
            ]
          : [{ type: "Firms", id: "LIST" }],
    }),
    getYarns: builder.query({
      query: (firmId) => ({ document: GET_YARNS, variables: { firmId } }),
      providesTags: (result) =>
        result?.yarns
          ? [
              ...result.yarns.map((y) => ({ type: "Yarns", id: y.id })),
              { type: "Yarns", id: "LIST" },
            ]
          : [{ type: "Yarns", id: "LIST" }],
    }),
    getBeams: builder.query({
      query: (status) => ({ document: GET_BEAMS, variables: { status } }),
      providesTags: (result) =>
        result?.beams
          ? [
              ...result.beams.map((b) => ({ type: "Beams", id: b.id })),
              { type: "Beams", id: "LIST" },
            ]
          : [{ type: "Beams", id: "LIST" }],
    }),
    // Example mutations
    addFirm: builder.mutation({
      query: ({ input }) => ({ document: ADD_FIRM, variables: { input } }),
      invalidatesTags: [{ type: "Firms", id: "LIST" }],
    }),
    addYarn: builder.mutation({
      query: ({ input }) => ({ document: ADD_YARN, variables: { input } }),
      invalidatesTags: [{ type: "Yarns", id: "LIST" }],
    }),
    updateBeamStatus: builder.mutation({
      query: ({ id, status }) => ({ document: UPDATE_BEAM_STATUS, variables: { id, status } }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Beams", id },
        { type: "Beams", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetFirmsQuery,
  useGetYarnsQuery,
  useGetBeamsQuery,
  useAddFirmMutation,
  useAddYarnMutation,
  useUpdateBeamStatusMutation,
} = graphqlApi;
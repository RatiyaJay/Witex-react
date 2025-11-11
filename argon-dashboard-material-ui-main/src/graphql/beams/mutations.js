export const UPDATE_BEAM_STATUS = `
  mutation UpdateBeamStatus($id: ID!, $status: String!) {
    updateBeamStatus(id: $id, status: $status) { id status }
  }
`;
export const GET_BEAMS = `
  query GetBeams($status: String) {
    beams(status: $status) { id beamCode status createdAt }
  }
`;
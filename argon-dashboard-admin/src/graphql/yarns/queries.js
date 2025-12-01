export const GET_YARNS = `
  query GetYarns($firmId: ID) {
    yarns(firmId: $firmId) {
      id
      challanNo
      qualityName
      grade
      netWeight
      truckNo
      firmId
    }
  }
`;
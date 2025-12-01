export const ADD_FIRM = `
  mutation AddFirm($input: FirmInput!) {
    addFirm(input: $input) { id name }
  }
`;
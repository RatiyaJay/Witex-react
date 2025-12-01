export const ADD_YARN = `
  mutation AddYarn($input: YarnInput!) {
    addYarn(input: $input) { id challanNo }
  }
`;
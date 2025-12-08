const typeDefs = `
  enum ShiftType { DAY NIGHT EXTRA }

  type Shift {
    id: ID!
    organizationId: ID!
    shiftType: ShiftType!
    startTime: String!
    endTime: String!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
    creator: User
    organization: Organization
  }

  input CreateShiftInput {
    shiftType: ShiftType!
    startTime: String!
    endTime: String!
  }

  input UpdateShiftInput {
    shiftType: ShiftType
    startTime: String
    endTime: String
  }
`;

module.exports = { typeDefs };

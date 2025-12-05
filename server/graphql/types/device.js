const typeDefs = `
  enum DeviceStatus { PENDING APPROVED REJECTED }

  type Device {
    id: ID!
    deviceId: String!
    status: DeviceStatus!
    machineName: String
    aliasMachineNo: String
    isActive: Boolean!
    ipv4Address: String
    organizationId: ID
    approvedBy: ID
    approvedAt: String
    rejectedBy: ID
    rejectedAt: String
    notes: String
    firstSeenAt: String!
    createdAt: String!
    updatedAt: String!
    approver: User
    rejecter: User
    organization: Organization
  }

  type DevicesPage {
    items: [Device!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  input ApproveDeviceInput {
    deviceId: ID!
    notes: String
  }

  input RejectDeviceInput {
    deviceId: ID!
    notes: String
  }

  input UpdateDeviceInput {
    machineName: String
    aliasMachineNo: String
    isActive: Boolean
    ipv4Address: String
    organizationId: ID
  }
`;

module.exports = { typeDefs };

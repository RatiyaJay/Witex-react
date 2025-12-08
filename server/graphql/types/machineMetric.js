const typeDefs = `
  type MachineMetric {
    id: ID!
    deviceId: String!
    organizationId: ID!
    shiftId: ID!
    shiftDate: String!
    powerOnMinutes: Int!
    runningMinutes: Int!
    efficiencyPercentage: Float!
    currentRpm: Int!
    lastUpdated: String!
    device: Device
    shift: Shift
    organization: Organization
  }

  type MachineMetricsPage {
    items: [MachineMetric!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }
`;

module.exports = { typeDefs };
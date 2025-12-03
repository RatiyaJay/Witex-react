const typeDefs = `
  enum ServiceType { MACHINE_MONITORING BUSINESS_MANAGEMENT BOTH }
  enum MachineType { WATER_JET RAPIER AIR_JET CIRCULAR TFO POWER_LOOM JACQUARD }

  type Organization {
    id: ID!
    name: String!
    email: String
    gstNo: String
    ownerName: String
    contactNo: String
    address: String
    startingDate: String
    endingDate: String
    ipAddress: String
    totalDevice: Int!
    totalEmployee: Int!
    demo: Boolean!
    serviceType: ServiceType!
    machineType: MachineType!
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrganizationInput {
    name: String!
    email: String
    gstNo: String
    ownerName: String
    contactNo: String
    address: String
    startingDate: String
    endingDate: String
    ipAddress: String
    totalDevice: Int
    totalEmployee: Int
    demo: Boolean
    serviceType: ServiceType!
    machineType: MachineType!
  }

  input UpdateOrganizationInput {
    name: String
    email: String
    gstNo: String
    ownerName: String
    contactNo: String
    address: String
    startingDate: String
    endingDate: String
    ipAddress: String
    totalDevice: Int
    totalEmployee: Int
    demo: Boolean
    serviceType: ServiceType
    machineType: MachineType
  }

  type OrganizationsPage {
    items: [Organization!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }
`;

module.exports = { typeDefs };

const typeDefs = `
  type WhatsappContact {
    id: ID!
    organizationId: ID!
    phoneNumber: String!
    name: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateWhatsappContactInput {
    phoneNumber: String!
    name: String
    isActive: Boolean
  }

  input UpdateWhatsappContactInput {
    phoneNumber: String
    name: String
    isActive: Boolean
  }

  type WhatsappContactsPage {
    items: [WhatsappContact!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }
`;

module.exports = { typeDefs };

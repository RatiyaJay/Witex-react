const typeDefs = `
  enum Role { SUPER_ADMIN USER }

  type User {
    id: ID!
    email: String!
    role: Role!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload { token: String!, user: User! }

  type UsersPage {
    items: [User!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }
`;

module.exports = { typeDefs };

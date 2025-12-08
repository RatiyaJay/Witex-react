const typeDefs = `
  enum Role { SUPER_ADMIN ADMIN OWNER SUPERVISOR MASTER CEO FITTER OPERATOR WARPER USER }

  type User {
    id: ID!
    name: String
    email: String!
    contactNo: String
    organizationId: ID
    organization: Organization
    role: Role!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateUserInput {
    name: String
    email: String!
    contactNo: String
    password: String!
    role: Role!
    isActive: Boolean
    organizationId: ID
  }

  input UpdateUserInput {
    name: String
    email: String
    contactNo: String
    organizationId: ID
    role: Role
    isActive: Boolean
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

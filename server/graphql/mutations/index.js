const resolvers = {
  Mutation: {
    _noop: () => true,
  }
};

const typeDefs = `
  type Mutation {
    _noop: Boolean
  }
`;

module.exports = { resolvers, typeDefs };

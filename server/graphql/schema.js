const { typeDefs: baseTypes } = require('./types/base');
const { resolvers: helloResolvers } = require('./queries/hello');
const { typeDefs: mutationTypes, resolvers: mutationResolvers } = require('./mutations');
const { typeDefs: userTypes } = require('./types/user');
const { resolvers: userQueryResolvers, typeDefs: userQueryTypes } = require('./queries/user');
const { resolvers: userMutationResolvers, typeDefs: userMutationTypes } = require('./mutations/user');

const typeDefs = [baseTypes, userTypes, userQueryTypes, mutationTypes, userMutationTypes].join('\n');
const resolvers = {
  Query: {
    ...helloResolvers.Query,
    ...userQueryResolvers.Query,
  },
  Mutation: {
    ...mutationResolvers.Mutation,
    ...userMutationResolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };

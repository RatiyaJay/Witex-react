const { typeDefs: baseTypes } = require('./types/base');
const { resolvers: helloResolvers } = require('./queries/hello');
const { typeDefs: mutationTypes, resolvers: mutationResolvers } = require('./mutations');
const { typeDefs: userTypes } = require('./types/user');
const { resolvers: userQueryResolvers, typeDefs: userQueryTypes } = require('./queries/user');
const { resolvers: userMutationResolvers, typeDefs: userMutationTypes } = require('./mutations/user');
const { typeDefs: organizationTypes } = require('./types/organization');
const { resolvers: organizationQueryResolvers, typeDefs: organizationQueryTypes } = require('./queries/organization');
const { resolvers: organizationMutationResolvers, typeDefs: organizationMutationTypes } = require('./mutations/organization');
const { typeDefs: whatsappTypes } = require('./types/whatsapp');
const { resolvers: whatsappQueryResolvers, typeDefs: whatsappQueryTypes } = require('./queries/whatsapp');
const { resolvers: whatsappMutationResolvers, typeDefs: whatsappMutationTypes } = require('./mutations/whatsapp');
const { typeDefs: deviceTypes } = require('./types/device');
const { resolvers: deviceQueryResolvers, typeDefs: deviceQueryTypes } = require('./queries/device');
const { resolvers: deviceMutationResolvers, typeDefs: deviceMutationTypes } = require('./mutations/device');

const typeDefs = [baseTypes, userTypes, organizationTypes, whatsappTypes, deviceTypes, userQueryTypes, organizationQueryTypes, whatsappQueryTypes, deviceQueryTypes, mutationTypes, userMutationTypes, organizationMutationTypes, whatsappMutationTypes, deviceMutationTypes].join('\n');
const resolvers = {
  Query: {
    ...helloResolvers.Query,
    ...userQueryResolvers.Query,
    ...organizationQueryResolvers.Query,
    ...whatsappQueryResolvers.Query,
    ...deviceQueryResolvers.Query,
  },
  Mutation: {
    ...mutationResolvers.Mutation,
    ...userMutationResolvers.Mutation,
    ...organizationMutationResolvers.Mutation,
    ...whatsappMutationResolvers.Mutation,
    ...deviceMutationResolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };

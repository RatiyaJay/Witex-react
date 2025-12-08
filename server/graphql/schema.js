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
const { typeDefs: shiftTypes } = require('./types/shift');
const { resolvers: shiftQueryResolvers, typeDefs: shiftQueryTypes } = require('./queries/shift');
const { resolvers: shiftMutationResolvers, typeDefs: shiftMutationTypes } = require('./mutations/shift');
const { typeDefs: machineMetricTypes } = require('./types/machineMetric');
const { resolvers: machineMetricQueryResolvers, typeDefs: machineMetricQueryTypes } = require('./queries/machineMetric');

const typeDefs = [baseTypes, userTypes, organizationTypes, whatsappTypes, deviceTypes, shiftTypes, machineMetricTypes, userQueryTypes, organizationQueryTypes, whatsappQueryTypes, deviceQueryTypes, shiftQueryTypes, machineMetricQueryTypes, mutationTypes, userMutationTypes, organizationMutationTypes, whatsappMutationTypes, deviceMutationTypes, shiftMutationTypes].join('\n');
const resolvers = {
  Query: {
    ...helloResolvers.Query,
    ...userQueryResolvers.Query,
    ...organizationQueryResolvers.Query,
    ...whatsappQueryResolvers.Query,
    ...deviceQueryResolvers.Query,
    ...shiftQueryResolvers.Query,
    ...machineMetricQueryResolvers.Query,
  },
  Mutation: {
    ...mutationResolvers.Mutation,
    ...userMutationResolvers.Mutation,
    ...organizationMutationResolvers.Mutation,
    ...whatsappMutationResolvers.Mutation,
    ...deviceMutationResolvers.Mutation,
    ...shiftMutationResolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };

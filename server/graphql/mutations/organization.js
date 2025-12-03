const db = require('../../dbmodels');
const { requireSuperAdmin } = require('../../utils/auth');
const { fromServiceType, fromMachineType } = require('../queries/organization');

function toOrg(o) {
  return {
    id: o.id,
    name: o.name,
    email: o.email || null,
    gstNo: o.gstNo || null,
    ownerName: o.ownerName || null,
    contactNo: o.contactNo || null,
    address: o.address || null,
    startingDate: o.startingDate ? o.startingDate.toISOString() : null,
    endingDate: o.endingDate ? o.endingDate.toISOString() : null,
    ipAddress: o.ipAddress || null,
    totalDevice: o.totalDevice,
    totalEmployee: o.totalEmployee,
    demo: !!o.demo,
    serviceType: (function(v){ const s = String(v||'').toLowerCase(); if (s==='machine_monitoring') return 'MACHINE_MONITORING'; if (s==='business_management') return 'BUSINESS_MANAGEMENT'; return 'BOTH'; })(o.serviceType),
    machineType: (function(v){ const s = String(v||'').toLowerCase(); if (s==='water_jet') return 'WATER_JET'; if (s==='rapier') return 'RAPIER'; if (s==='air_jet') return 'AIR_JET'; if (s==='circular') return 'CIRCULAR'; if (s==='tfo') return 'TFO'; if (s==='power_loom') return 'POWER_LOOM'; return 'JACQUARD'; })(o.machineType),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

const resolvers = {
  Mutation: {
    createOrganization: async (_, { input }, ctx) => {
      requireSuperAdmin(ctx);
      const created = await db.Organization.create({
        name: input.name,
        email: input.email || null,
        gstNo: input.gstNo || null,
        ownerName: input.ownerName || null,
        contactNo: input.contactNo || null,
        address: input.address || null,
        startingDate: input.startingDate ? new Date(input.startingDate) : null,
        endingDate: input.endingDate ? new Date(input.endingDate) : null,
        ipAddress: input.ipAddress || null,
        totalDevice: typeof input.totalDevice === 'number' ? input.totalDevice : 0,
        totalEmployee: typeof input.totalEmployee === 'number' ? input.totalEmployee : 0,
        demo: typeof input.demo === 'boolean' ? input.demo : false,
        serviceType: fromServiceType(input.serviceType),
        machineType: fromMachineType(input.machineType),
      });
      return toOrg(created);
    },
    updateOrganization: async (_, { organizationId, input }, ctx) => {
      requireSuperAdmin(ctx);
      const o = await db.Organization.findByPk(organizationId);
      if (!o) throw new Error('Organization not found');
      if (typeof input.name !== 'undefined') o.name = input.name;
      if (typeof input.email !== 'undefined') o.email = input.email;
      if (typeof input.gstNo !== 'undefined') o.gstNo = input.gstNo;
      if (typeof input.ownerName !== 'undefined') o.ownerName = input.ownerName;
      if (typeof input.contactNo !== 'undefined') o.contactNo = input.contactNo;
      if (typeof input.address !== 'undefined') o.address = input.address;
      if (typeof input.startingDate !== 'undefined') o.startingDate = input.startingDate ? new Date(input.startingDate) : null;
      if (typeof input.endingDate !== 'undefined') o.endingDate = input.endingDate ? new Date(input.endingDate) : null;
      if (typeof input.ipAddress !== 'undefined') o.ipAddress = input.ipAddress;
      if (typeof input.totalDevice !== 'undefined') o.totalDevice = input.totalDevice;
      if (typeof input.totalEmployee !== 'undefined') o.totalEmployee = input.totalEmployee;
      if (typeof input.demo !== 'undefined') o.demo = !!input.demo;
      if (typeof input.serviceType !== 'undefined') o.serviceType = fromServiceType(input.serviceType);
      if (typeof input.machineType !== 'undefined') o.machineType = fromMachineType(input.machineType);
      await o.save();
      return toOrg(o);
    },
    deleteOrganization: async (_, { organizationId }, ctx) => {
      requireSuperAdmin(ctx);
      const o = await db.Organization.findByPk(organizationId);
      if (!o) return false;
      await o.destroy();
      return true;
    },
  },
};

const typeDefs = `
  extend type Mutation {
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(organizationId: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(organizationId: ID!): Boolean!
  }
`;

module.exports = { resolvers, typeDefs };

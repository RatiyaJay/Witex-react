const db = require('../../dbmodels');
const { Op } = require('sequelize');
const { requireSuperAdmin } = require('../../utils/auth');

function toServiceType(dbVal) {
  const v = String(dbVal || '').toLowerCase();
  if (v === 'machine_monitoring') return 'MACHINE_MONITORING';
  if (v === 'business_management') return 'BUSINESS_MANAGEMENT';
  return 'BOTH';
}

function fromServiceType(gqlVal) {
  const v = String(gqlVal || '').toUpperCase();
  if (v === 'MACHINE_MONITORING') return 'machine_monitoring';
  if (v === 'BUSINESS_MANAGEMENT') return 'business_management';
  return 'both';
}

function toMachineType(dbVal) {
  const v = String(dbVal || '').toLowerCase();
  if (v === 'water_jet') return 'WATER_JET';
  if (v === 'rapier') return 'RAPIER';
  if (v === 'air_jet') return 'AIR_JET';
  if (v === 'circular') return 'CIRCULAR';
  if (v === 'tfo') return 'TFO';
  if (v === 'power_loom') return 'POWER_LOOM';
  return 'JACQUARD';
}

function fromMachineType(gqlVal) {
  const v = String(gqlVal || '').toUpperCase();
  if (v === 'WATER_JET') return 'water_jet';
  if (v === 'RAPIER') return 'rapier';
  if (v === 'AIR_JET') return 'air_jet';
  if (v === 'CIRCULAR') return 'circular';
  if (v === 'TFO') return 'tfo';
  if (v === 'POWER_LOOM') return 'power_loom';
  return 'jacquard';
}

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
    serviceType: toServiceType(o.serviceType),
    machineType: toMachineType(o.machineType),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

const resolvers = {
  Query: {
    organization: async (_, { id }, ctx) => {
      requireSuperAdmin(ctx);
      const o = await db.Organization.findByPk(id);
      if (!o) return null;
      return toOrg(o);
    },
    organizations: async (_, { page = 1, pageSize = 10, search }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;
      let where = {};
      if (search && search.trim()) {
        const term = `%${search}%`;
        where = {
          [Op.or]: [
            { name: { [Op.like]: term } },
            { email: { [Op.like]: term } },
            { gstNo: { [Op.like]: term } },
            { ownerName: { [Op.like]: term } },
            { contactNo: { [Op.like]: term } },
            { address: { [Op.like]: term } },
            { ipAddress: { [Op.like]: term } },
          ],
        };
      }
      const res = await db.Organization.findAndCountAll({ where, limit, offset, order: [["id", "ASC"]] });
      return {
        items: res.rows.map(toOrg),
        total: res.count,
        page,
        pageSize: limit,
      };
    },
  },
};

const typeDefs = `
  extend type Query {
    organization(id: ID!): Organization
    organizations(page: Int, pageSize: Int, search: String): OrganizationsPage!
  }
`;

module.exports = { resolvers, typeDefs, fromServiceType, fromMachineType };

const db = require('../../dbmodels');
const { Op } = require('sequelize');
const { requireSuperAdmin } = require('../../utils/auth');

const resolvers = {
  Query: {
    devices: async (_, { page = 1, pageSize = 10, search, status, organizationId, isActive, onlyConfigured }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;

      const where = {};
      
      // Filter by status if provided
      if (status) {
        where.status = status.toLowerCase();
      }

      // Filter by organization
      if (organizationId) {
        where.organizationId = organizationId;
      }

      // Filter by active status
      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      // Only show configured devices (with machine name)
      if (onlyConfigured) {
        where.machineName = { [Op.ne]: null };
      }

      // Search functionality
      if (search && search.trim()) {
        where[Op.or] = [
          { deviceId: { [Op.like]: `%${search}%` } },
          { machineName: { [Op.like]: `%${search}%` } },
          { aliasMachineNo: { [Op.like]: `%${search}%` } },
          { ipv4Address: { [Op.like]: `%${search}%` } },
        ];
      }

      const { rows, count } = await db.Device.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: db.User, as: 'rejecter', attributes: ['id', 'name', 'email'] },
          { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        ],
      });

      return {
        items: rows.map(toDevice),
        total: count,
        page,
        pageSize: limit,
      };
    },
    approvedDevices: async (_, { page = 1, pageSize = 10, search, organizationId, isActive }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;

      const where = { status: 'approved' };
      
      // Filter by organization
      if (organizationId) {
        where.organizationId = organizationId;
      }

      // Filter by active status
      if (typeof isActive === 'boolean') {
        where.isActive = isActive;
      }

      // Search functionality
      if (search && search.trim()) {
        where[Op.or] = [
          { deviceId: { [Op.like]: `%${search}%` } },
          { machineName: { [Op.like]: `%${search}%` } },
          { aliasMachineNo: { [Op.like]: `%${search}%` } },
          { ipv4Address: { [Op.like]: `%${search}%` } },
        ];
      }

      const { rows, count } = await db.Device.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        ],
      });

      return {
        items: rows.map(toDevice),
        total: count,
        page,
        pageSize: limit,
      };
    },
    pendingDevicesCount: async (_, __, ctx) => {
      requireSuperAdmin(ctx);
      const count = await db.Device.count({ where: { status: 'pending' } });
      return count;
    },
  },
};

function toDevice(d) {
  return {
    id: d.id,
    deviceId: d.deviceId,
    status: d.status.toUpperCase(),
    machineName: d.machineName,
    aliasMachineNo: d.aliasMachineNo,
    isActive: d.isActive,
    ipv4Address: d.ipv4Address,
    organizationId: d.organizationId,
    approvedBy: d.approvedBy,
    approvedAt: d.approvedAt ? d.approvedAt.toISOString() : null,
    rejectedBy: d.rejectedBy,
    rejectedAt: d.rejectedAt ? d.rejectedAt.toISOString() : null,
    notes: d.notes,
    firstSeenAt: d.firstSeenAt.toISOString(),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    approver: d.approver ? {
      id: d.approver.id,
      name: d.approver.name,
      email: d.approver.email,
    } : null,
    rejecter: d.rejecter ? {
      id: d.rejecter.id,
      name: d.rejecter.name,
      email: d.rejecter.email,
    } : null,
    organization: d.organization ? {
      id: d.organization.id,
      name: d.organization.name,
    } : null,
  };
}

const typeDefs = `
  extend type Query {
    devices(page: Int, pageSize: Int, search: String, status: DeviceStatus, organizationId: ID, isActive: Boolean, onlyConfigured: Boolean): DevicesPage!
    approvedDevices(page: Int, pageSize: Int, search: String, organizationId: ID, isActive: Boolean): DevicesPage!
    pendingDevicesCount: Int!
  }
`;

module.exports = { resolvers, typeDefs };

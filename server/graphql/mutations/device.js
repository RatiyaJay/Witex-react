const db = require('../../dbmodels');
const { requireSuperAdmin } = require('../../utils/auth');

const resolvers = {
  Mutation: {
    approveDevice: async (_, { input }, ctx) => {
      requireSuperAdmin(ctx);
      const { deviceId, notes } = input;

      const device = await db.Device.findByPk(deviceId);
      if (!device) throw new Error('Device not found');
      if (device.status === 'approved') throw new Error('Device already approved');

      device.status = 'approved';
      device.approvedBy = ctx.user.id;
      device.approvedAt = new Date();
      device.rejectedBy = null;
      device.rejectedAt = null;
      if (notes) device.notes = notes;

      await device.save();

      const updated = await db.Device.findByPk(device.id, {
        include: [
          { model: db.User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: db.User, as: 'rejecter', attributes: ['id', 'name', 'email'] },
        ],
      });

      return toDevice(updated);
    },

    rejectDevice: async (_, { input }, ctx) => {
      requireSuperAdmin(ctx);
      const { deviceId, notes } = input;

      const device = await db.Device.findByPk(deviceId);
      if (!device) throw new Error('Device not found');
      if (device.status === 'rejected') throw new Error('Device already rejected');

      device.status = 'rejected';
      device.rejectedBy = ctx.user.id;
      device.rejectedAt = new Date();
      device.approvedBy = null;
      device.approvedAt = null;
      if (notes) device.notes = notes;

      await device.save();

      const updated = await db.Device.findByPk(device.id, {
        include: [
          { model: db.User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: db.User, as: 'rejecter', attributes: ['id', 'name', 'email'] },
        ],
      });

      return toDevice(updated);
    },
  },
};

function toDevice(d) {
  return {
    id: d.id,
    deviceId: d.deviceId,
    status: d.status.toUpperCase(),
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
  };
}

const resolvers2 = {
  Mutation: {
    updateDevice: async (_, { deviceId, input }, ctx) => {
      requireSuperAdmin(ctx);

      const device = await db.Device.findByPk(deviceId);
      if (!device) throw new Error('Device not found');
      if (device.status !== 'approved') throw new Error('Only approved devices can be updated');

      if (typeof input.machineName !== 'undefined') device.machineName = input.machineName;
      if (typeof input.aliasMachineNo !== 'undefined') device.aliasMachineNo = input.aliasMachineNo;
      if (typeof input.isActive === 'boolean') device.isActive = input.isActive;
      if (typeof input.ipv4Address !== 'undefined') device.ipv4Address = input.ipv4Address;
      if (typeof input.organizationId !== 'undefined') {
        device.organizationId = input.organizationId ? Number(input.organizationId) : null;
      }

      await device.save();

      const updated = await db.Device.findByPk(device.id, {
        include: [
          { model: db.User, as: 'approver', attributes: ['id', 'name', 'email'] },
          { model: db.User, as: 'rejecter', attributes: ['id', 'name', 'email'] },
          { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        ],
      });

      return toDevice(updated);
    },
  },
};

const typeDefs = `
  extend type Mutation {
    approveDevice(input: ApproveDeviceInput!): Device!
    rejectDevice(input: RejectDeviceInput!): Device!
    updateDevice(deviceId: ID!, input: UpdateDeviceInput!): Device!
  }
`;

module.exports = { resolvers: { ...resolvers, ...resolvers2 }, typeDefs };

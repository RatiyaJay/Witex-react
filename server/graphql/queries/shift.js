const db = require('../../dbmodels');

const resolvers = {
  Query: {
    shifts: async (_, __, ctx) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      const user = await db.User.findByPk(ctx.user.id);
      if (!user || !user.organizationId) throw new Error('User not associated with organization');

      const shifts = await db.Shift.findAll({
        where: { organizationId: user.organizationId },
        include: [
          { model: db.User, as: 'creator' },
          { model: db.Organization, as: 'organization' },
        ],
        order: [['startTime', 'ASC']],
      });

      return shifts.map(toShift);
    },
  },
};

function toShift(s) {
  return {
    id: s.id,
    organizationId: s.organizationId,
    shiftType: s.shiftType.toUpperCase(),
    startTime: s.startTime,
    endTime: s.endTime,
    createdBy: s.createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    creator: s.creator ? {
      id: s.creator.id,
      name: s.creator.name,
      email: s.creator.email,
    } : null,
    organization: s.organization ? {
      id: s.organization.id,
      name: s.organization.name,
    } : null,
  };
}

const typeDefs = `
  extend type Query {
    shifts: [Shift!]!
  }
`;

module.exports = { resolvers, typeDefs };

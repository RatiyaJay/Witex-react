const db = require('../../dbmodels');
const { Op } = require('sequelize');
const { requireSuperAdmin } = require('../../utils/auth');

function toContact(c) {
  return {
    id: c.id,
    organizationId: c.organizationId,
    phoneNumber: c.phoneNumber,
    name: c.name || null,
    isActive: !!c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

const resolvers = {
  Query: {
    organizationWhatsappContacts: async (_, { organizationId, page = 1, pageSize = 10, search }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;
      const where = { organizationId: Number(organizationId) };
      if (search && search.trim()) {
        const term = `%${search}%`;
        where[Op.or] = [
          { phoneNumber: { [Op.like]: term } },
          { name: { [Op.like]: term } },
        ];
      }
      const res = await db.WhatsappContact.findAndCountAll({ where, limit, offset, order: [["id","ASC"]] });
      return { items: res.rows.map(toContact), total: res.count, page, pageSize: limit };
    },
  },
};

const typeDefs = `
  extend type Query {
    organizationWhatsappContacts(organizationId: ID!, page: Int, pageSize: Int, search: String): WhatsappContactsPage!
  }
`;

module.exports = { resolvers, typeDefs };

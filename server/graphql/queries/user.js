const db = require('../../dbmodels');
const { requireSuperAdmin } = require('../../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      if (!ctx.user) return null;
      const u = await db.User.findByPk(ctx.user.id);
      if (!u) return null;
      return toUser(u);
    },
    users: async (_, { page = 1, pageSize = 10 }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;
      const { rows, count } = await db.User.findAndCountAll({ limit, offset, order: [['id', 'ASC']] });
      return {
        items: rows.map(toUser),
        total: count,
        page,
        pageSize: limit,
      };
    },
  },
};

function toUser(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role === 'super_admin' ? 'SUPER_ADMIN' : 'USER',
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

const typeDefs = `
  extend type Query {
    me: User
    users(page: Int, pageSize: Int): UsersPage!
  }
`;

module.exports = { resolvers, typeDefs };

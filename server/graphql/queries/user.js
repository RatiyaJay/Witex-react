const db = require('../../dbmodels');
const { Op } = require('sequelize');
const { requireSuperAdmin } = require('../../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      if (!ctx.user) return null;
      const u = await db.User.findByPk(ctx.user.id, {
        include: [{ model: db.Organization, as: 'organizationRef' }]
      });
      if (!u) return null;
      return toUser(u);
    },
    superAdminCount: async (_, __, ctx) => {
      requireSuperAdmin(ctx);
      const count = await db.User.count({ where: { role: 'super_admin', isActive: true } });
      return count;
    },
    users: async (_, { page = 1, pageSize = 10, search }, ctx) => {
      requireSuperAdmin(ctx);
      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;
      // If search term provided, prefer Elasticsearch for fast multi-field search
      let rows, count;
      if (search && search.trim()) {
        try {
          const { esSearchIds, esTotal } = await require('../searchHelper').searchUsers(search, page, limit);
          count = esTotal;
          rows = await db.User.findAll({ 
            where: { id: esSearchIds }, 
            include: [{ model: db.Organization, as: 'organizationRef' }],
            order: [['id', 'ASC']] 
          });
        } catch (_) {
          const term = `%${search}%`;
          const res = await db.User.findAndCountAll({
            where: {
              [Op.or]: [
                { name: { [Op.like]: term } },
                { email: { [Op.like]: term } },
                { contactNo: { [Op.like]: term } },
              ],
            },
            include: [{ model: db.Organization, as: 'organizationRef' }],
            limit,
            offset,
            order: [['id', 'ASC']],
          });
          rows = res.rows;
          count = res.count;
        }
      } else {
        const res = await db.User.findAndCountAll({ 
          include: [{ model: db.Organization, as: 'organizationRef' }],
          limit, 
          offset, 
          order: [['id', 'ASC']] 
        });
        rows = res.rows;
        count = res.count;
      }
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
    name: u.name,
    email: u.email,
    contactNo: u.contactNo,
    organizationId: u.organizationId,
    organization: u.organizationRef ? {
      id: u.organizationRef.id,
      name: u.organizationRef.name,
    } : null,
    role: toGraphRole(u.role),
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function toGraphRole(dbRole) {
  const r = String(dbRole || '').toLowerCase();
  switch (r) {
    case 'super_admin': return 'SUPER_ADMIN';
    case 'admin': return 'ADMIN';
    case 'owner': return 'OWNER';
    case 'supervisor': return 'SUPERVISOR';
    case 'master': return 'MASTER';
    case 'ceo': return 'CEO';
    case 'fitter': return 'FITTER';
    case 'operator': return 'OPERATOR';
    case 'warper': return 'WARPER';
    default: return 'USER';
  }
}

const typeDefs = `
  extend type Query {
    me: User
    superAdminCount: Int!
    users(page: Int, pageSize: Int, search: String): UsersPage!
  }
`;

module.exports = { resolvers, typeDefs };

const db = require('../../dbmodels');
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
  Mutation: {
    createWhatsappContact: async (_, { organizationId, input }, ctx) => {
      requireSuperAdmin(ctx);
      const created = await db.WhatsappContact.create({
        organizationId: Number(organizationId),
        phoneNumber: input.phoneNumber,
        name: input.name || null,
        isActive: typeof input.isActive === 'boolean' ? input.isActive : true,
      });
      return toContact(created);
    },
    createWhatsappContacts: async (_, { organizationId, entries }, ctx) => {
      requireSuperAdmin(ctx);
      const orgId = Number(organizationId);
      const created = await db.sequelize.transaction(async (t) => {
        const rows = await db.WhatsappContact.bulkCreate(
          entries.map((e) => ({ organizationId: orgId, phoneNumber: e.phoneNumber, name: e.name || null, isActive: typeof e.isActive === 'boolean' ? e.isActive : true })),
          { transaction: t }
        );
        return rows;
      });
      return created.map(toContact);
    },
    updateWhatsappContact: async (_, { contactId, input }, ctx) => {
      requireSuperAdmin(ctx);
      const c = await db.WhatsappContact.findByPk(contactId);
      if (!c) throw new Error('Whatsapp contact not found');
      if (typeof input.phoneNumber !== 'undefined') c.phoneNumber = input.phoneNumber;
      if (typeof input.name !== 'undefined') c.name = input.name;
      if (typeof input.isActive !== 'undefined') c.isActive = !!input.isActive;
      await c.save();
      return toContact(c);
    },
    deleteWhatsappContact: async (_, { contactId }, ctx) => {
      requireSuperAdmin(ctx);
      const c = await db.WhatsappContact.findByPk(contactId);
      if (!c) return false;
      await c.destroy();
      return true;
    },
  },
};

const typeDefs = `
  extend type Mutation {
    createWhatsappContact(organizationId: ID!, input: CreateWhatsappContactInput!): WhatsappContact!
    createWhatsappContacts(organizationId: ID!, entries: [CreateWhatsappContactInput!]!): [WhatsappContact!]!
    updateWhatsappContact(contactId: ID!, input: UpdateWhatsappContactInput!): WhatsappContact!
    deleteWhatsappContact(contactId: ID!): Boolean!
  }
`;

module.exports = { resolvers, typeDefs };

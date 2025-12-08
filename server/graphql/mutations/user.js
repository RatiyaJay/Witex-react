const bcrypt = require('bcrypt');
const db = require('../../dbmodels');
const { signToken, requireSuperAdmin } = require('../../utils/auth');
const { sendOtpEmail } = require('../../utils/mailer');
const searchHelper = require('../searchHelper');

function roleString(role) {
  const r = String(role || '').toUpperCase();
  switch (r) {
    case 'SUPER_ADMIN': return 'super_admin';
    case 'ADMIN': return 'admin';
    case 'OWNER': return 'owner';
    case 'SUPERVISOR': return 'supervisor';
    case 'MASTER': return 'master';
    case 'CEO': return 'ceo';
    case 'FITTER': return 'fitter';
    case 'OPERATOR': return 'operator';
    case 'WARPER': return 'warper';
    default: return 'user';
  }
}

const resolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await db.User.findOne({ 
        where: { email },
        include: [{ model: db.Organization, as: 'organizationRef' }]
      });
      if (!user || !user.isActive) throw new Error('Invalid credentials');
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw new Error('Invalid credentials');
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return { token, user: toUser(user) };
    },
    createUser: async (_, { email, password, role, name, contactNo, isActive, organizationId }, ctx) => {
      requireSuperAdmin(ctx);
      const exists = await db.User.findOne({ where: { email } });
      if (exists) throw new Error('Email already in use');
      const hash = await bcrypt.hash(password, 10);
      const created = await db.User.create({
        email,
        passwordHash: hash,
        role: roleString(role),
        name: name || null,
        contactNo: contactNo || null,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        organizationId: organizationId ? Number(organizationId) : null,
      });
      await created.reload({ include: [{ model: db.Organization, as: 'organizationRef' }] });
      searchHelper.indexUser(created).catch(() => {});
      return toUser(created);
    },
    updateUser: async (_, { userId, input }, ctx) => {
      requireSuperAdmin(ctx);
      const user = await db.User.findByPk(userId);
      if (!user) throw new Error('User not found');
      const incomingRole = input.role ? roleString(input.role) : undefined;
      const demotingLastSuperAdmin = user.role === 'super_admin' && typeof incomingRole !== 'undefined' && incomingRole !== 'super_admin';
      const deactivatingLastSuperAdmin = user.role === 'super_admin' && typeof input.isActive !== 'undefined' && input.isActive === false;
      if (demotingLastSuperAdmin || deactivatingLastSuperAdmin) {
        const count = await db.User.count({ where: { role: 'super_admin', isActive: true } });
        if (count <= 1) throw new Error('At least one active super admin is required');
      }
      if (input.email) {
        const exists = await db.User.findOne({ where: { email: input.email } });
        if (exists && exists.id !== user.id) throw new Error('Email already in use');
        user.email = input.email;
      }
      if (input.role) user.role = roleString(input.role);
      if (typeof input.name !== 'undefined') user.name = input.name;
      if (typeof input.contactNo !== 'undefined') user.contactNo = input.contactNo;
      if (typeof input.organizationId !== 'undefined') user.organizationId = input.organizationId ? Number(input.organizationId) : null;
      if (typeof input.isActive === 'boolean') user.isActive = input.isActive;
      await user.save();
      await user.reload({ include: [{ model: db.Organization, as: 'organizationRef' }] });
      searchHelper.indexUser(user).catch(() => {});
      return toUser(user);
    },
    deleteUser: async (_, { userId }, ctx) => {
      requireSuperAdmin(ctx);
      const user = await db.User.findByPk(userId);
      if (!user) return false;
      if (user.role === 'super_admin') {
        const count = await db.User.count({ where: { role: 'super_admin', isActive: true } });
        if (count <= 1) throw new Error('Cannot delete the last active super admin');
      }
      await user.destroy();
      searchHelper.removeUser(userId).catch(() => {});
      return true;
    },
    updateUserPassword: async (_, { userId, newPassword }, ctx) => {
      requireSuperAdmin(ctx);
      const user = await db.User.findByPk(userId);
      if (!user) throw new Error('User not found');
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
      searchHelper.indexUser(user).catch(() => {});
      return true;
    },
    requestPasswordReset: async (_, { email }, ctx) => {
      const user = await db.User.findOne({ where: { email } });
      if (!user) return true; // avoid leaking
      if (user.role === 'super_admin') throw new Error('Super admin cannot use OTP reset');
      const otp = generateOtp();
      const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
      user.otpCode = otp;
      user.otpExpiresAt = new Date(Date.now() + minutes * 60_000);
      await user.save();
      await sendOtpEmail(email, otp);
      return true;
    },
    resetPassword: async (_, { email, otp, newPassword }) => {
      const user = await db.User.findOne({ where: { email } });
      if (!user) throw new Error('Invalid request');
      if (!user.otpCode || !user.otpExpiresAt) throw new Error('OTP not requested');
      if (user.otpCode !== otp || user.otpExpiresAt.getTime() < Date.now()) throw new Error('Invalid or expired OTP');
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.otpCode = null;
      user.otpExpiresAt = null;
      await user.save();
      return true;
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

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createUser(email: String!, password: String!, role: Role!, name: String, contactNo: String, isActive: Boolean, organizationId: ID): User!
    updateUser(userId: ID!, input: UpdateUserInput!): User!
    deleteUser(userId: ID!): Boolean!
    updateUserPassword(userId: ID!, newPassword: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(email: String!, otp: String!, newPassword: String!): Boolean!
  }
`;

module.exports = { resolvers, typeDefs };

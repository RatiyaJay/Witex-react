const bcrypt = require('bcrypt');
const db = require('../../dbmodels');
const { signToken, requireSuperAdmin } = require('../../utils/auth');
const { sendOtpEmail } = require('../../utils/mailer');

function roleString(role) {
  return role === 'SUPER_ADMIN' ? 'super_admin' : 'user';
}

const resolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await db.User.findOne({ where: { email } });
      if (!user || !user.isActive) throw new Error('Invalid credentials');
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw new Error('Invalid credentials');
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return { token, user: toUser(user) };
    },
    createUser: async (_, { email, password, role }, ctx) => {
      requireSuperAdmin(ctx);
      const exists = await db.User.findOne({ where: { email } });
      if (exists) throw new Error('Email already in use');
      const hash = await bcrypt.hash(password, 10);
      const created = await db.User.create({ email, passwordHash: hash, role: roleString(role) });
      return toUser(created);
    },
    updateUserPassword: async (_, { userId, newPassword }, ctx) => {
      requireSuperAdmin(ctx);
      const user = await db.User.findByPk(userId);
      if (!user) throw new Error('User not found');
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
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
    email: u.email,
    role: u.role === 'super_admin' ? 'SUPER_ADMIN' : 'USER',
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const typeDefs = `
  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createUser(email: String!, password: String!, role: Role!): User!
    updateUserPassword(userId: ID!, newPassword: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(email: String!, otp: String!, newPassword: String!): Boolean!
  }
`;

module.exports = { resolvers, typeDefs };

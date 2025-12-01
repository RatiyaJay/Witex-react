const jwt = require('jsonwebtoken');

function authContext(req) {
  const tokenHeader = req.headers.authorization || '';
  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader;
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  return { token, user };
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '12h' });
}

function requireAuth(ctx) {
  if (!ctx.user) throw new Error('Unauthorized');
}

function requireSuperAdmin(ctx) {
  requireAuth(ctx);
  if (ctx.user.role !== 'super_admin') throw new Error('Forbidden');
}

module.exports = { authContext, signToken, requireAuth, requireSuperAdmin };

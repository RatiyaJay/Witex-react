'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('User@123', 10);
    const [ttx] = await queryInterface.sequelize.query(`SELECT id FROM organizations WHERE name = 'Technotex Solutions' LIMIT 1`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const [acme] = await queryInterface.sequelize.query(`SELECT id FROM organizations WHERE name = 'Acme Textiles' LIMIT 1`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const [prime] = await queryInterface.sequelize.query(`SELECT id FROM organizations WHERE name = 'Prime Looms' LIMIT 1`, { type: queryInterface.sequelize.QueryTypes.SELECT });

    const users = [
      { email: 'acme.admin@witex.in', password_hash: passwordHash, role: 'admin', name: 'Acme Admin', contact_no: '9000000001', organization_id: acme?.id || null, is_active: true, created_at: now, updated_at: now },
      { email: 'prime.operator@witex.in', password_hash: passwordHash, role: 'operator', name: 'Prime Operator', contact_no: '9000000002', organization_id: prime?.id || null, is_active: true, created_at: now, updated_at: now },
      { email: 'ttx.supervisor@witex.in', password_hash: passwordHash, role: 'supervisor', name: 'Technotex Supervisor', contact_no: '9000000003', organization_id: ttx?.id || null, is_active: true, created_at: now, updated_at: now },
    ];
    // Avoid duplicates
    for (const u of users) {
      const [exists] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = :email LIMIT 1`, {
        replacements: { email: u.email },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      });
      if (!exists) await queryInterface.bulkInsert('users', [u]);
    }
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('users', { email: ['acme.admin@witex.in','prime.operator@witex.in','ttx.supervisor@witex.in'] });
  }
};

'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface) {
    const email = process.env.SUPER_ADMIN_EMAIL || 'technotexsolutions.srt@gmail.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
    const hash = await bcrypt.hash(password, 10);

    const [existing] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE email = :email LIMIT 1`, {
      replacements: { email },
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    if (!existing) {
      await queryInterface.bulkInsert('users', [{
        email,
        password_hash: hash,
        role: 'super_admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }]);
    }
  },

  async down (queryInterface) {
    const email = process.env.SUPER_ADMIN_EMAIL || 'technotexsolutions.srt@gmail.com';
    await queryInterface.bulkDelete('users', { email });
  }
};

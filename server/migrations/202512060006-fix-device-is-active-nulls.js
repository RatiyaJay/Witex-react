'use strict';

module.exports = {
  async up(queryInterface) {
    // Update all NULL is_active values to true (default)
    await queryInterface.sequelize.query(`
      UPDATE devices 
      SET is_active = true 
      WHERE is_active IS NULL
    `);
  },

  async down(queryInterface) {
    // No rollback needed - we're just fixing data consistency
  },
};
'use strict';

module.exports = {
  async up(queryInterface) {
    // Remove the organization string column as we're using organization_id instead
    await queryInterface.removeColumn('users', 'organization');
  },

  async down(queryInterface, Sequelize) {
    // Add it back if we need to rollback
    await queryInterface.addColumn('users', 'organization', {
      type: Sequelize.STRING(160),
      allowNull: true,
    });
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'name', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn('users', 'contact_no', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('users', 'organization', { type: Sequelize.STRING(160), allowNull: true });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
    await queryInterface.addIndex('users', ['is_active'], { name: 'users_active_idx' });
    await queryInterface.addIndex('users', ['organization'], { name: 'users_org_idx' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_org_idx');
    await queryInterface.removeIndex('users', 'users_active_idx');
    await queryInterface.removeIndex('users', 'users_role_idx');
    await queryInterface.removeColumn('users', 'organization');
    await queryInterface.removeColumn('users', 'contact_no');
    await queryInterface.removeColumn('users', 'name');
  }
};

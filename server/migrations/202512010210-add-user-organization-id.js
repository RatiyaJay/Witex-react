'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'organization_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addConstraint('users', {
      fields: ['organization_id'],
      type: 'foreign key',
      references: { table: 'organizations', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      name: 'users_organization_fk'
    });
    await queryInterface.addIndex('users', ['organization_id'], { name: 'users_organization_idx' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_organization_idx');
    await queryInterface.removeConstraint('users', 'users_organization_fk');
    await queryInterface.removeColumn('users', 'organization_id');
  }
};

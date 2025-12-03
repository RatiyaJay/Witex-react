'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('organizations', 'machine_type', { type: Sequelize.ENUM('water_jet','rapier','air_jet','circular','tfo','power_loom','jacquard'), allowNull: false, defaultValue: 'water_jet' });
    await queryInterface.addIndex('organizations', ['machine_type'], { name: 'org_machine_idx' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('organizations', 'org_machine_idx');
    await queryInterface.removeColumn('organizations', 'machine_type');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organizations_machine_type"');
    }
  }
};

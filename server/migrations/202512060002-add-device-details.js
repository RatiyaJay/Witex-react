'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('devices', 'machine_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('devices', 'alias_machine_no', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('devices', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    await queryInterface.addColumn('devices', 'ipv4_address', {
      type: Sequelize.STRING(15),
      allowNull: true,
    });

    await queryInterface.addColumn('devices', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('devices', ['organization_id'], {
      name: 'devices_organization_id_idx',
    });

    await queryInterface.addIndex('devices', ['is_active'], {
      name: 'devices_is_active_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('devices', 'machine_name');
    await queryInterface.removeColumn('devices', 'alias_machine_no');
    await queryInterface.removeColumn('devices', 'is_active');
    await queryInterface.removeColumn('devices', 'ipv4_address');
    await queryInterface.removeColumn('devices', 'organization_id');
  },
};

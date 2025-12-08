'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('machine_metrics', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      device_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'devices',
          key: 'device_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shift_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'shifts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shift_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      power_on_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      running_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      efficiency_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      current_rpm: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('machine_metrics', ['device_id'], {
      name: 'machine_metrics_device_id_idx',
    });

    await queryInterface.addIndex('machine_metrics', ['organization_id'], {
      name: 'machine_metrics_organization_id_idx',
    });

    await queryInterface.addIndex('machine_metrics', ['shift_date'], {
      name: 'machine_metrics_shift_date_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('machine_metrics');
  },
};
'use strict';

module.exports = (sequelize, DataTypes) => {
  const MachineMetric = sequelize.define(
    'MachineMetric',
    {
      deviceId: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shiftId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shiftDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      powerOnMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      runningMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      efficiencyPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      currentRpm: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'machine_metrics',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['device_id', 'organization_id', 'shift_id', 'shift_date'],
          name: 'machine_metrics_unique_device_shift_date',
        },
      ],
    }
  );

  MachineMetric.associate = (db) => {
    MachineMetric.belongsTo(db.Device, { foreignKey: 'device_id', as: 'device' });
    MachineMetric.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'organization' });
    MachineMetric.belongsTo(db.Shift, { foreignKey: 'shift_id', as: 'shift' });
  };

  return MachineMetric;
};
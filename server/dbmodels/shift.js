'use strict';

module.exports = (sequelize, DataTypes) => {
  const Shift = sequelize.define(
    'Shift',
    {
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shiftType: {
        type: DataTypes.ENUM('day', 'night', 'extra'),
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'shifts',
      underscored: true,
    }
  );

  Shift.associate = (db) => {
    Shift.belongsTo(db.Organization, { foreignKey: 'organization_id', as: 'organization' });
    Shift.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Shift;
};

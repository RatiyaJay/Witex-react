"use strict";

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    "Device",
    {
      deviceId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'device_id',
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      machineName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'machine_name',
      },
      aliasMachineNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'alias_machine_no',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'is_active',
      },
      ipv4Address: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'ipv4_address',
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'organization_id',
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'approved_by',
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at',
      },
      rejectedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'rejected_by',
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'rejected_at',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      firstSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'first_seen_at',
      },
    },
    {
      tableName: "devices",
      underscored: true,
      indexes: [
        { unique: true, fields: ["device_id"] },
        { fields: ["status"] },
        { fields: ["created_at"] },
        { fields: ["organization_id"] },
        { fields: ["is_active"] },
      ],
    }
  );

  Device.associate = (db) => {
    Device.belongsTo(db.User, { foreignKey: "approved_by", as: "approver" });
    Device.belongsTo(db.User, { foreignKey: "rejected_by", as: "rejecter" });
    Device.belongsTo(db.Organization, { foreignKey: "organization_id", as: "organization" });
  };

  return Device;
};

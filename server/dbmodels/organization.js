"use strict";

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
    {
      name: { type: DataTypes.STRING(160), allowNull: false },
      email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },
      gstNo: { type: DataTypes.STRING(30), allowNull: true },
      ownerName: { type: DataTypes.STRING(120), allowNull: true },
      contactNo: { type: DataTypes.STRING(30), allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      startingDate: { type: DataTypes.DATE, allowNull: true },
      endingDate: { type: DataTypes.DATE, allowNull: true },
      ipAddress: { type: DataTypes.STRING(64), allowNull: true },
      totalDevice: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      totalEmployee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      serviceType: { type: DataTypes.ENUM("machine_monitoring", "business_management", "both"), allowNull: false },
      machineType: { type: DataTypes.ENUM("water_jet","rapier","air_jet","circular","tfo","power_loom","jacquard"), allowNull: false, defaultValue: "water_jet" },
    },
    {
      tableName: "organizations",
      underscored: true,
      indexes: [
        { fields: ["name"], name: "org_name_idx" },
        { fields: ["email"], name: "org_email_idx" },
        { fields: ["gst_no"], name: "org_gst_idx" },
        { fields: ["service_type"], name: "org_service_idx" },
        { fields: ["machine_type"], name: "org_machine_idx" },
      ],
    }
  );

  Organization.associate = (db) => {
    Organization.hasMany(db.User, { foreignKey: "organization_id", as: "users" });
  };

  return Organization;
};

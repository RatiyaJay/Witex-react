"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: { type: DataTypes.STRING(120), allowNull: true },
      email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING(200), allowNull: false },
      role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "user" },
      contactNo: { type: DataTypes.STRING(30), allowNull: true },
      organization: { type: DataTypes.STRING(160), allowNull: true },
      organizationId: { type: DataTypes.INTEGER, allowNull: true },
      otpCode: { type: DataTypes.STRING(6), allowNull: true },
      otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: "users",
      underscored: true,
      indexes: [{ unique: true, fields: ["email"] }],
    }
  );

  User.associate = (db) => {
    User.belongsTo(db.Organization, { foreignKey: "organization_id", as: "organizationRef" });
  };

  return User;
};

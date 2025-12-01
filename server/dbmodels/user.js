"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING(200), allowNull: false },
      role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "user" },
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

  return User;
};

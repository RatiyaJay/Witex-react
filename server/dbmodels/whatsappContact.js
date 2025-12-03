"use strict";

module.exports = (sequelize, DataTypes) => {
  const WhatsappContact = sequelize.define(
    "WhatsappContact",
    {
      organizationId: { type: DataTypes.INTEGER, allowNull: false },
      phoneNumber: { type: DataTypes.STRING(30), allowNull: false },
      name: { type: DataTypes.STRING(120), allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: "whatsapp_contacts",
      underscored: true,
      indexes: [
        { fields: ["organization_id"], name: "wa_org_idx" },
        { fields: ["phone_number"], name: "wa_phone_idx" },
      ],
    }
  );

  WhatsappContact.associate = (db) => {
    WhatsappContact.belongsTo(db.Organization, { foreignKey: "organization_id", as: "organization" });
  };

  return WhatsappContact;
};

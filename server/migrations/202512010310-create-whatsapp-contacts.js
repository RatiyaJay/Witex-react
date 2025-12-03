'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_contacts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      organization_id: { type: Sequelize.INTEGER, allowNull: false },
      phone_number: { type: Sequelize.STRING(30), allowNull: false },
      name: { type: Sequelize.STRING(120), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('whatsapp_contacts', {
      fields: ['organization_id'],
      type: 'foreign key',
      references: { table: 'organizations', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      name: 'wa_org_fk'
    });
    await queryInterface.addIndex('whatsapp_contacts', ['organization_id'], { name: 'wa_org_idx' });
    await queryInterface.addIndex('whatsapp_contacts', ['phone_number'], { name: 'wa_phone_idx' });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('whatsapp_contacts', 'wa_phone_idx');
    await queryInterface.removeIndex('whatsapp_contacts', 'wa_org_idx');
    await queryInterface.removeConstraint('whatsapp_contacts', 'wa_org_fk');
    await queryInterface.dropTable('whatsapp_contacts');
  }
};

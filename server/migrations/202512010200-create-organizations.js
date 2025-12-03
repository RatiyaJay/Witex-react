'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(160), allowNull: false },
      email: { type: Sequelize.STRING(120) },
      gst_no: { type: Sequelize.STRING(30) },
      owner_name: { type: Sequelize.STRING(120) },
      contact_no: { type: Sequelize.STRING(30) },
      address: { type: Sequelize.TEXT },
      starting_date: { type: Sequelize.DATE },
      ending_date: { type: Sequelize.DATE },
      ip_address: { type: Sequelize.STRING(64) },
      total_device: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_employee: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      demo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      service_type: { type: Sequelize.ENUM('machine_monitoring','business_management','both'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('organizations', ['name'], { name: 'org_name_idx' });
    await queryInterface.addIndex('organizations', ['email'], { name: 'org_email_idx' });
    await queryInterface.addIndex('organizations', ['gst_no'], { name: 'org_gst_idx' });
    await queryInterface.addIndex('organizations', ['service_type'], { name: 'org_service_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organizations');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, clean up any duplicate records by keeping only the latest one per device/shift/date
      await queryInterface.sequelize.query(`
        DELETE m1 FROM machine_metrics m1
        INNER JOIN machine_metrics m2 
        WHERE m1.device_id = m2.device_id 
        AND m1.organization_id = m2.organization_id 
        AND m1.shift_id = m2.shift_id 
        AND DATE(m1.shift_date) = DATE(m2.shift_date)
        AND m1.id < m2.id
      `);
      
      console.log('✅ Cleaned up duplicate machine metrics records');
      
      // Add unique constraint to prevent duplicate rows per device per shift per date
      await queryInterface.addConstraint('machine_metrics', {
        fields: ['device_id', 'organization_id', 'shift_id', 'shift_date'],
        type: 'unique',
        name: 'machine_metrics_unique_device_shift_date',
      });
      
      console.log('✅ Added unique constraint to machine_metrics table');
    } catch (error) {
      console.error('❌ Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('machine_metrics', 'machine_metrics_unique_device_shift_date');
  },
};
'use strict';

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    const orgs = [
      { name: 'Technotex Solutions', email: 'contact@technotex.in', gst_no: 'GST-TTX-001', owner_name: 'Technotex Owner', contact_no: '9999999999', address: 'Surat', starting_date: now, ending_date: null, ip_address: '127.0.0.1', total_device: 20, total_employee: 150, demo: false, service_type: 'machine_monitoring', machine_type: 'water_jet', created_at: now, updated_at: now },
      { name: 'Acme Textiles', email: 'hello@acmetextiles.com', gst_no: 'GST-ACME-002', owner_name: 'Jane', contact_no: '8888888888', address: 'Surat', starting_date: now, ending_date: null, ip_address: '127.0.0.2', total_device: 10, total_employee: 80, demo: false, service_type: 'business_management', machine_type: 'rapier', created_at: now, updated_at: now },
      { name: 'Prime Looms', email: 'info@primelooms.com', gst_no: 'GST-PRIME-003', owner_name: 'John', contact_no: '7777777777', address: 'Surat', starting_date: now, ending_date: null, ip_address: '127.0.0.3', total_device: 12, total_employee: 95, demo: true, service_type: 'both', machine_type: 'jacquard', created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('organizations', orgs);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('organizations', { name: ['Technotex Solutions','Acme Textiles','Prime Looms'] });
  }
};

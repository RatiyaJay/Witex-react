const db = require('../dbmodels');
const sequelize = require('../db/sequelize');

/**
 * Syncs new device IDs from device_rpm_logs and device_state_logs tables
 * into the devices table for approval workflow
 */
async function syncNewDevices() {
  try {
    // Get unique device IDs from device_rpm_logs
    const rpmDevices = await sequelize.query(
      `SELECT DISTINCT device_id FROM device_rpm_logs WHERE device_id IS NOT NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Get unique device IDs from device_state_logs
    const stateDevices = await sequelize.query(
      `SELECT DISTINCT device_id FROM device_state_logs WHERE device_id IS NOT NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Combine and deduplicate device IDs
    const allDeviceIds = new Set();
    rpmDevices.forEach(row => allDeviceIds.add(row.device_id));
    stateDevices.forEach(row => allDeviceIds.add(row.device_id));

    let newDevicesCount = 0;

    // Check each device ID and add to devices table if not exists
    for (const deviceId of allDeviceIds) {
      const exists = await db.Device.findOne({ where: { deviceId } });
      
      if (!exists) {
        // Get first seen timestamp from both tables
        const firstSeenRpm = await sequelize.query(
          `SELECT MIN(created_at) as first_seen FROM device_rpm_logs WHERE device_id = ?`,
          { replacements: [deviceId], type: sequelize.QueryTypes.SELECT }
        );

        const firstSeenState = await sequelize.query(
          `SELECT MIN(created_at) as first_seen FROM device_state_logs WHERE device_id = ?`,
          { replacements: [deviceId], type: sequelize.QueryTypes.SELECT }
        );

        const firstSeenRpmDate = firstSeenRpm[0]?.first_seen;
        const firstSeenStateDate = firstSeenState[0]?.first_seen;

        let firstSeenAt = new Date();
        if (firstSeenRpmDate && firstSeenStateDate) {
          firstSeenAt = new Date(Math.min(
            new Date(firstSeenRpmDate).getTime(),
            new Date(firstSeenStateDate).getTime()
          ));
        } else if (firstSeenRpmDate) {
          firstSeenAt = new Date(firstSeenRpmDate);
        } else if (firstSeenStateDate) {
          firstSeenAt = new Date(firstSeenStateDate);
        }

        await db.Device.create({
          deviceId,
          status: 'pending',
          firstSeenAt,
        });

        newDevicesCount++;
        console.log(`✅ New device added for approval: ${deviceId}`);
      }
    }

    if (newDevicesCount > 0) {
      console.log(`🔄 Device sync complete: ${newDevicesCount} new device(s) added`);
    }

    return newDevicesCount;
  } catch (error) {
    console.error('❌ Error syncing devices:', error);
    throw error;
  }
}

/**
 * Start periodic device sync (runs every 5 minutes)
 */
function startDeviceSyncScheduler(intervalMinutes = 5) {
  console.log(`🔄 Device sync scheduler started (every ${intervalMinutes} minutes)`);
  
  // Run immediately on start
  syncNewDevices().catch(err => console.error('Device sync error:', err));
  
  // Then run periodically
  setInterval(() => {
    syncNewDevices().catch(err => console.error('Device sync error:', err));
  }, intervalMinutes * 60 * 1000);
}

module.exports = {
  syncNewDevices,
  startDeviceSyncScheduler,
};

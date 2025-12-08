const db = require('../dbmodels');
const { Op } = require('sequelize');

// Helper to get current active shift for organization
async function getCurrentActiveShift(organizationId) {
  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format (matching database format)
  
  console.log(`🕐 Current time: ${currentTime}`);
  
  const shifts = await db.Shift.findAll({
    where: { organizationId },
    order: [['startTime', 'ASC']],
  });

  console.log(`📋 Found ${shifts.length} shifts for organization ${organizationId}`);

  for (const shift of shifts) {
    const startTime = shift.startTime.substring(0, 5); // HH:MM format
    const endTime = shift.endTime.substring(0, 5); // HH:MM format
    
    console.log(`⏰ Checking shift: ${shift.shiftType} (${startTime} - ${endTime})`);
    
    // Handle overnight shifts
    if (startTime <= endTime) {
      // Same day shift (e.g., 09:00 - 17:00)
      if (currentTime >= startTime && currentTime <= endTime) {
        console.log(`✅ Found active same-day shift: ${shift.shiftType}`);
        return shift;
      }
    } else {
      // Overnight shift (e.g., 22:00 - 06:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        console.log(`✅ Found active overnight shift: ${shift.shiftType}`);
        return shift;
      }
    }
  }
  
  console.log(`⚠️ No active shift found for current time: ${currentTime}`);
  return null;
}

// Calculate machine metrics for current shift
async function calculateMachineMetrics(organizationId) {
  try {
    console.log(`🔍 Checking metrics for organization ${organizationId}`);
    
    const currentShift = await getCurrentActiveShift(organizationId);
    if (!currentShift) {
      console.log(`⚠️ No active shift found for organization ${organizationId}`);
      return;
    }
    
    console.log(`✅ Found active shift: ${currentShift.shiftType} (${currentShift.startTime} - ${currentShift.endTime})`);

    // Get approved devices for this organization
    const approvedDevices = await db.Device.findAll({
      where: {
        organizationId,
        status: 'approved',
        isActive: true,
      },
    });
    
    console.log(`📱 Found ${approvedDevices.length} approved devices for org ${organizationId}`);

    const today = new Date().toISOString().split('T')[0];
    
    for (const device of approvedDevices) {
      console.log(`⚙️ Calculating metrics for device: ${device.deviceId}`);
      await calculateDeviceMetrics(device, currentShift, today);
    }

    console.log(`✅ Machine metrics calculated for organization ${organizationId}`);
  } catch (error) {
    console.error(`❌ Error calculating machine metrics for org ${organizationId}:`, error);
  }
}

// Calculate metrics for a specific device
async function calculateDeviceMetrics(device, shift, shiftDate) {
  try {
    const now = new Date();
    const startOfDay = new Date(shiftDate + 'T' + shift.startTime);
    const endOfDay = new Date(shiftDate + 'T' + shift.endTime);
    
    // Handle overnight shifts
    if (shift.startTime > shift.endTime) {
      if (now.getHours() < 12) {
        // We're in the next day part of overnight shift
        startOfDay.setDate(startOfDay.getDate() - 1);
      } else {
        // We're in the same day part of overnight shift
        endOfDay.setDate(endOfDay.getDate() + 1);
      }
    }

    // Use UPSERT to update existing record or create new one
    // The unique constraint on (deviceId, organizationId, shiftId, shiftDate) ensures no duplicates
    const [metric] = await db.MachineMetric.upsert({
      deviceId: device.deviceId,
      organizationId: device.organizationId,
      shiftId: shift.id,
      shiftDate: new Date(shiftDate),
      powerOnMinutes: 0,
      runningMinutes: 0,
      efficiencyPercentage: 0.00,
      currentRpm: 0,
      lastUpdated: now,
    }, {
      returning: true,
      conflictFields: ['deviceId', 'organizationId', 'shiftId', 'shiftDate'], // Explicit conflict resolution
    });

    // Calculate power on time (total minutes since shift started)
    const shiftStartTime = Math.max(startOfDay.getTime(), startOfDay.getTime());
    const currentTime = Math.min(now.getTime(), endOfDay.getTime());
    const powerOnMinutes = Math.floor((currentTime - shiftStartTime) / (1000 * 60));

    // Get running time from device_state_logs
    const runningMinutes = await calculateRunningTime(device.deviceId, startOfDay, now);
    
    // Get current RPM from device_rpm_logs
    const currentRpm = await getCurrentRPM(device.deviceId);

    // Calculate efficiency
    const efficiencyPercentage = powerOnMinutes > 0 ? (runningMinutes / powerOnMinutes) * 100 : 0;

    // Update the same record (UPSERT again to ensure single record per device per shift)
    await db.MachineMetric.upsert({
      deviceId: device.deviceId,
      organizationId: device.organizationId,
      shiftId: shift.id,
      shiftDate: new Date(shiftDate),
      powerOnMinutes: Math.max(0, powerOnMinutes),
      runningMinutes: Math.max(0, runningMinutes),
      efficiencyPercentage: Math.min(100, Math.max(0, efficiencyPercentage)),
      currentRpm: currentRpm || 0,
      lastUpdated: now,
    }, {
      conflictFields: ['deviceId', 'organizationId', 'shiftId', 'shiftDate'], // Explicit conflict resolution
    });

  } catch (error) {
    console.error(`❌ Error calculating metrics for device ${device.deviceId}:`, error);
  }
}

// Calculate running time from device_state_logs
async function calculateRunningTime(deviceId, startTime, endTime) {
  try {
    // This would query device_state_logs table
    // For now, return a mock calculation
    // In real implementation, you would:
    // 1. Query device_state_logs WHERE device_id = deviceId AND timestamp BETWEEN startTime AND endTime
    // 2. Sum up all minutes where state = 'running'
    
    const mockRunningMinutes = Math.floor(Math.random() * 60) + 30; // Mock data
    return mockRunningMinutes;
  } catch (error) {
    console.error(`Error calculating running time for ${deviceId}:`, error);
    return 0;
  }
}

// Get current RPM from device_rpm_logs
async function getCurrentRPM(deviceId) {
  try {
    // This would query device_rpm_logs table
    // For now, return a mock RPM
    // In real implementation, you would:
    // 1. Query device_rpm_logs WHERE device_id = deviceId ORDER BY timestamp DESC LIMIT 1
    // 2. Return the latest RPM value
    
    const mockRpm = Math.floor(Math.random() * 200) + 100; // Mock data
    return mockRpm;
  } catch (error) {
    console.error(`Error getting current RPM for ${deviceId}:`, error);
    return 0;
  }
}

// Start metrics calculation scheduler
function startMachineMetricsScheduler() {
  console.log('🔄 Machine metrics scheduler started (every 1 minute)');
  
  // Run immediately
  calculateAllOrganizationMetrics();
  
  // Then run every minute
  setInterval(() => {
    calculateAllOrganizationMetrics();
  }, 60 * 1000); // 1 minute
}

// Calculate metrics for all organizations
async function calculateAllOrganizationMetrics() {
  try {
    const organizations = await db.Organization.findAll({
      attributes: ['id'],
    });

    for (const org of organizations) {
      await calculateMachineMetrics(org.id);
    }
  } catch (error) {
    console.error('❌ Error in machine metrics scheduler:', error);
  }
}

// Generate test data for development
async function generateTestMachineMetrics() {
  try {
    console.log('🧪 Generating test machine metrics...');
    
    // Get all organizations
    const organizations = await db.Organization.findAll();
    
    for (const org of organizations) {
      // Get current active shift for this org
      const currentShift = await getCurrentActiveShift(org.id);
      if (!currentShift) {
        console.log(`⚠️ No active shift for org ${org.id}, skipping test data generation`);
        continue;
      }
      
      // Get approved devices for this org
      const devices = await db.Device.findAll({
        where: {
          organizationId: org.id,
          status: 'approved',
          isActive: true,
        },
      });
      
      if (devices.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        
        for (const device of devices) {
          // Create or update test metrics ONLY for current active shift
          const powerOnMinutes = Math.floor(Math.random() * 480) + 60; // 1-8 hours
          const runningMinutes = Math.floor(Math.random() * Math.min(powerOnMinutes, 300)) + 30; // 30min-5hours (but not more than power on)
          const efficiencyPercentage = (runningMinutes / powerOnMinutes) * 100;
          
          await db.MachineMetric.upsert({
            deviceId: device.deviceId,
            organizationId: org.id,
            shiftId: currentShift.id, // Only current active shift
            shiftDate: new Date(today),
            powerOnMinutes,
            runningMinutes,
            efficiencyPercentage: Math.round(efficiencyPercentage * 10) / 10, // Round to 1 decimal
            currentRpm: Math.floor(Math.random() * 200) + 100, // 100-300 RPM
            lastUpdated: new Date(),
          }, {
            conflictFields: ['deviceId', 'organizationId', 'shiftId', 'shiftDate'], // Explicit conflict resolution
          });
        }
        
        console.log(`✅ Generated test metrics for org ${org.id} (${devices.length} devices, current shift: ${currentShift.shiftType})`);
      }
    }
  } catch (error) {
    console.error('❌ Error generating test data:', error);
  }
}

module.exports = {
  calculateMachineMetrics,
  startMachineMetricsScheduler,
  getCurrentActiveShift,
  generateTestMachineMetrics,
};
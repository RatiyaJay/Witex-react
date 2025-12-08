const db = require('../../dbmodels');

const resolvers = {
  Query: {
    machineMetrics: async (_, { page = 1, pageSize = 10, search }, ctx) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      const user = await db.User.findByPk(ctx.user.id);
      if (!user || !user.organizationId) {
        throw new Error('User not associated with organization');
      }

      // Get current active shift for this organization
      const { getCurrentActiveShift } = require('../../utils/machineMetricsCalculator');
      const currentShift = await getCurrentActiveShift(user.organizationId);
      
      if (!currentShift) {
        return {
          items: [],
          total: 0,
          page,
          pageSize: Math.min(pageSize, 100),
        };
      }

      const limit = Math.min(pageSize, 100);
      const offset = (Math.max(page, 1) - 1) * limit;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get unique devices with their latest metrics for current shift only
      const subQuery = `
        SELECT mm.device_id, MAX(mm.last_updated) as latest_update
        FROM machine_metrics mm
        WHERE mm.organization_id = ${user.organizationId} 
        AND mm.shift_id = ${currentShift.id}
        AND DATE(mm.shift_date) = '${today}'
        GROUP BY mm.device_id
      `;

      let whereClause = {
        organizationId: user.organizationId,
        shiftId: currentShift.id,
        shiftDate: {
          [db.Sequelize.Op.gte]: new Date(today),
        },
        [db.Sequelize.Op.and]: [
          db.Sequelize.literal(`(MachineMetric.device_id, MachineMetric.last_updated) IN (${subQuery})`)
        ],
      };

      // Add search functionality
      if (search && search.trim()) {
        whereClause = {
          ...whereClause,
          [db.Sequelize.Op.or]: [
            { deviceId: { [db.Sequelize.Op.like]: `%${search}%` } },
            { '$device.machine_name$': { [db.Sequelize.Op.like]: `%${search}%` } },
            { '$device.alias_machine_no$': { [db.Sequelize.Op.like]: `%${search}%` } },
          ],
        };
      }

      const { rows, count } = await db.MachineMetric.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: db.Device, 
            as: 'device',
            required: true,
          },
          { 
            model: db.Shift, 
            as: 'shift',
            required: true,
          },
          { 
            model: db.Organization, 
            as: 'organization',
            required: true,
          },
        ],
        limit,
        offset,
        order: [['deviceId', 'ASC']], // Order by device ID
        distinct: true, // Ensure unique results
      });

      return {
        items: rows.map(toMachineMetric),
        total: count,
        page,
        pageSize: limit,
      };
    },
  },
};

function toMachineMetric(m) {
  return {
    id: m.id,
    deviceId: m.deviceId,
    organizationId: m.organizationId,
    shiftId: m.shiftId,
    shiftDate: m.shiftDate.toISOString().split('T')[0],
    powerOnMinutes: m.powerOnMinutes,
    runningMinutes: m.runningMinutes,
    efficiencyPercentage: parseFloat(m.efficiencyPercentage),
    currentRpm: m.currentRpm,
    lastUpdated: m.lastUpdated.toISOString(),
    device: m.device ? {
      id: m.device.id,
      deviceId: m.device.deviceId,
      machineName: m.device.machineName,
      aliasMachineNo: m.device.aliasMachineNo,
      isActive: m.device.isActive,
    } : null,
    shift: m.shift ? {
      id: m.shift.id,
      shiftType: m.shift.shiftType.toUpperCase(),
      startTime: m.shift.startTime,
      endTime: m.shift.endTime,
    } : null,
    organization: m.organization ? {
      id: m.organization.id,
      name: m.organization.name,
    } : null,
  };
}

const typeDefs = `
  extend type Query {
    machineMetrics(page: Int, pageSize: Int, search: String): MachineMetricsPage!
  }
`;

module.exports = { resolvers, typeDefs };
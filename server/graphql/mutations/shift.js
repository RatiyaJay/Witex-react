const db = require('../../dbmodels');

// Helper to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to calculate duration considering overnight shifts
function calculateDuration(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes;
  } else {
    // Overnight shift
    return (24 * 60) - startMinutes + endMinutes;
  }
}

// Validate 24-hour limit
async function validateShiftDuration(organizationId, startTime, endTime, excludeShiftId = null) {
  const where = { organizationId };
  if (excludeShiftId) {
    where.id = { [db.Sequelize.Op.ne]: excludeShiftId };
  }

  const existingShifts = await db.Shift.findAll({ where });
  
  // Calculate total duration of existing shifts
  let totalMinutes = 0;
  existingShifts.forEach(shift => {
    totalMinutes += calculateDuration(shift.startTime, shift.endTime);
  });

  // Add new shift duration
  const newDuration = calculateDuration(startTime, endTime);
  totalMinutes += newDuration;

  if (totalMinutes > 24 * 60) {
    throw new Error('Total shift duration cannot exceed 24 hours');
  }

  // Check for overlaps
  for (const shift of existingShifts) {
    if (shiftsOverlap(shift.startTime, shift.endTime, startTime, endTime)) {
      throw new Error('Shift times overlap with existing shift');
    }
  }

  return true;
}

// Check if two shifts overlap
function shiftsOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Handle overnight shifts
  const isOvernight1 = e1 < s1;
  const isOvernight2 = e2 < s2;

  if (!isOvernight1 && !isOvernight2) {
    return (s1 < e2 && e1 > s2);
  }

  // Complex overlap logic for overnight shifts
  if (isOvernight1 && !isOvernight2) {
    return (s2 >= s1 || e2 <= e1);
  }

  if (!isOvernight1 && isOvernight2) {
    return (s1 >= s2 || e1 <= e2);
  }

  // Both overnight
  return true;
}

const resolvers = {
  Mutation: {
    createShift: async (_, { input }, ctx) => {
      if (!ctx.user) throw new Error('Not authenticated');

      const user = await db.User.findByPk(ctx.user.id);
      if (!user || !user.organizationId) {
        throw new Error('User not associated with organization');
      }

      // Validate 24-hour limit
      await validateShiftDuration(user.organizationId, input.startTime, input.endTime);

      const shift = await db.Shift.create({
        organizationId: user.organizationId,
        shiftType: input.shiftType.toLowerCase(),
        startTime: input.startTime,
        endTime: input.endTime,
        createdBy: user.id,
      });

      await shift.reload({
        include: [
          { model: db.User, as: 'creator' },
          { model: db.Organization, as: 'organization' },
        ],
      });

      return toShift(shift);
    },

    updateShift: async (_, { shiftId, input }, ctx) => {
      if (!ctx.user) throw new Error('Not authenticated');

      const user = await db.User.findByPk(ctx.user.id);
      if (!user || !user.organizationId) {
        throw new Error('User not associated with organization');
      }

      const shift = await db.Shift.findByPk(shiftId);
      if (!shift) throw new Error('Shift not found');

      if (shift.organizationId !== user.organizationId) {
        throw new Error('Not authorized to update this shift');
      }

      const startTime = input.startTime || shift.startTime;
      const endTime = input.endTime || shift.endTime;

      // Validate 24-hour limit
      await validateShiftDuration(user.organizationId, startTime, endTime, shiftId);

      if (input.shiftType) shift.shiftType = input.shiftType.toLowerCase();
      if (input.startTime) shift.startTime = input.startTime;
      if (input.endTime) shift.endTime = input.endTime;

      await shift.save();
      await shift.reload({
        include: [
          { model: db.User, as: 'creator' },
          { model: db.Organization, as: 'organization' },
        ],
      });

      return toShift(shift);
    },

    deleteShift: async (_, { shiftId }, ctx) => {
      if (!ctx.user) throw new Error('Not authenticated');

      const user = await db.User.findByPk(ctx.user.id);
      if (!user || !user.organizationId) {
        throw new Error('User not associated with organization');
      }

      const shift = await db.Shift.findByPk(shiftId);
      if (!shift) throw new Error('Shift not found');

      if (shift.organizationId !== user.organizationId) {
        throw new Error('Not authorized to delete this shift');
      }

      await shift.destroy();
      return true;
    },
  },
};

function toShift(s) {
  return {
    id: s.id,
    organizationId: s.organizationId,
    shiftType: s.shiftType.toUpperCase(),
    startTime: s.startTime,
    endTime: s.endTime,
    createdBy: s.createdBy,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    creator: s.creator ? {
      id: s.creator.id,
      name: s.creator.name,
      email: s.creator.email,
    } : null,
    organization: s.organization ? {
      id: s.organization.id,
      name: s.organization.name,
    } : null,
  };
}

const typeDefs = `
  extend type Mutation {
    createShift(input: CreateShiftInput!): Shift!
    updateShift(shiftId: ID!, input: UpdateShiftInput!): Shift!
    deleteShift(shiftId: ID!): Boolean!
  }
`;

module.exports = { resolvers, typeDefs };

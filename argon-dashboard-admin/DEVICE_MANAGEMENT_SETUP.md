# Device Management - Admin Panel Setup

## ✅ Installation Complete

The Device Management system has been successfully added to the **argon-dashboard-admin** panel.

## What Was Added

### 1. Device Management Page
- **Location**: `argon-dashboard-admin/src/layouts/device-management/index.js`
- **Route**: `/device-management`
- **Access**: Admin/Super Admin only

### 2. Sidebar Menu Item
- Added under "Admin" section in the sidebar
- Icon: devices
- Appears after WhatsApp Management

## Features

✅ **View Devices**
- Filter by status: Pending, Approved, Rejected, All
- Search by device ID
- Pagination (10 devices per page)

✅ **Approve/Reject Devices**
- Approve button (✓) for pending devices
- Reject button (✗) for pending devices
- Add optional notes for approval/rejection decisions
- Confirmation dialog before action

✅ **Device Information**
- Device ID
- Status (Pending/Approved/Rejected)
- First seen timestamp
- Approved/Rejected by (user name and timestamp)
- Notes

✅ **Real-time Updates**
- UI refreshes after approve/reject actions
- Shows latest device status

## How to Access

1. **Login** to the admin panel
2. Navigate to **Admin** section in sidebar
3. Click on **Device Management**
4. You'll see all devices from `device_rpm_logs` and `device_state_logs` tables

## Backend Integration

The admin panel connects to the GraphQL API at:
- **Endpoint**: `http://localhost:4001/graphql` (or your configured server)
- **Queries**: `devices`, `pendingDevicesCount`
- **Mutations**: `approveDevice`, `rejectDevice`

## Automatic Device Detection

The backend server automatically:
- Scans `device_rpm_logs` and `device_state_logs` tables every 5 minutes
- Detects new device IDs
- Creates pending entries in the `devices` table
- These appear in the admin panel for approval

## Usage Workflow

1. **New Device Appears**
   - Device sends data to `device_rpm_logs` or `device_state_logs`
   - Backend detects it within 5 minutes
   - Device appears in "Pending" tab

2. **Admin Reviews**
   - Admin opens Device Management page
   - Sees pending devices
   - Reviews device ID

3. **Admin Approves/Rejects**
   - Clicks approve (✓) or reject (✗)
   - Adds optional notes
   - Confirms action

4. **Device Status Updated**
   - Device status changes to Approved/Rejected
   - Timestamp and admin info recorded
   - Device no longer appears in Pending tab

## Troubleshooting

### Device Management page not showing
- Check if you're logged in as Super Admin
- Verify the route is added in `src/routes.js`
- Check browser console for errors

### No devices appearing
- Verify backend server is running
- Check if `device_rpm_logs` and `device_state_logs` tables have data
- Check server logs for sync errors
- Manually trigger sync (see backend README)

### GraphQL errors
- Verify GraphQL endpoint is correct in `src/config/apollo.js`
- Check authentication token is valid
- Ensure user has Super Admin role
- Check server logs for detailed errors

## Next Steps

1. **Test the System**
   - Add test data to `device_rpm_logs` or `device_state_logs`
   - Wait 5 minutes or manually trigger sync
   - Check if device appears in admin panel

2. **Customize**
   - Adjust sync interval in `server/index.js`
   - Modify UI colors/styling as needed
   - Add additional fields if required

3. **Monitor**
   - Check server logs for device sync activity
   - Monitor pending devices count
   - Review approval/rejection patterns

## Support

For issues or questions:
- Check server logs: `server/index.js` console output
- Review backend README: `server/DEVICE_MANAGEMENT_README.md`
- Verify database tables exist and have correct schema

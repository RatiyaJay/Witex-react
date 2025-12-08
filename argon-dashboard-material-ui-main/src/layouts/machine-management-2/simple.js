import { useState } from "react";
import Card from "@mui/material/Card";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function MachineManagement2Simple() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Card>
          <ArgonBox p={3}>
            <ArgonTypography variant="h6">
              Machine Management 2 - Simple Test
            </ArgonTypography>
            <ArgonTypography variant="body2" color="text">
              This is a simple test component to verify the basic structure works.
            </ArgonTypography>
          </ArgonBox>
        </Card>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default MachineManagement2Simple;
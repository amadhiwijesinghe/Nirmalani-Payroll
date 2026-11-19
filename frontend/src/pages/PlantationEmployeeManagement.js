import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import Employees from "./Employees";
import Allowance from "./Allowances";
import Payslips from "./Payslips";

export default function PlantationEmployeeManagement({ plantation }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Employees" />
        <Tab label="Allowances" />
        <Tab label="Payslips" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Employees plantation={plantation} />
        )}

        {activeTab === 1 && (
          <Allowance plantation={plantation} />
        )}

        {activeTab === 2 && (
          <Payslips plantation={plantation} />
        )}
      </Box>
    </Box>
  );
}
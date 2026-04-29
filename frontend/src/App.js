import { useState } from 'react';
import { Toolbar, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Employees from './pages/Employees';
import Payslips from './pages/Payslips';
import Login from './pages/login';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Allowance from './pages/Allowances';

function App() {
  const [page, setPage] = useState("employees");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#6366f1',
      },
      background: {
        default: darkMode ? '#020617' : '#f5f5f5',
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
  });

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>

        {/* SIDEBAR */}
        <Sidebar setPage={setPage} currentPage={page} />

        {/* MAIN AREA */}
        <Box sx={{ flexGrow: 1 }}>

          {/* TOPBAR */}
          <Topbar
            toggleDarkMode={() => setDarkMode(!darkMode)}
            darkMode={darkMode}
          />

          {/* SPACE FOR FIXED TOPBAR */}
          <Toolbar />

          {/* CONTENT */}
          <Box
            sx={{
              p: 3,
              minHeight: "100vh",
              background: "linear-gradient(135deg, #020617, #0f172a)"
            }}
          >

            <AnimatePresence mode="wait">

              {page === "employees" && (
                <motion.div
                  key="employees"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <Employees />
                </motion.div>
              )}

              {page === "payslips" && (
                <motion.div
                  key="payslips"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <Payslips />
                </motion.div>
              )}

              {page === "attendance" && (
                <motion.div
                  key="attendance"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <Attendance />
                </motion.div>
              )}

              {page === "payroll" && (
                <motion.div
                  key="payroll"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <Payroll />
                </motion.div>
              )}

              {page === "allowance" && (
                <motion.div
                  key="allowance"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <Allowance />
                </motion.div>
              )}

            </AnimatePresence>

          </Box>

        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
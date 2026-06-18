import { useState } from 'react';
import { Toolbar, Box, useMediaQuery } from '@mui/material';
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
import PlantationPayroll from './pages/PlantationWorkers';
import RubberTappers from './pages/RubberTappers';
import TeaCollection from './pages/TeaCollection';
import RubberDispatch from './pages/RubberDistpatch';
import CasualWorkers from './pages/CasualWorkers';
import Income from "./pages/Income";
import Expenditure from "./pages/Expenditure";
import FinancialDashboard from "./pages/FinancialDashboard";
import IngurupaththalaDashboard from "./pages/IngurupaththalaDashboard";
import CinnamonCollection from './pages/CinnamonCollection';
import CoconutCollection from './pages/CoconutCollection';


function App() {
  const [page, setPage] = useState("employees");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const isMobile = useMediaQuery("(max-width:900px)");
  const [plantation, setPlantation] = useState("nirmalani");

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
        <Sidebar setPage={setPage} currentPage={page} plantation={plantation}/>

        {/* MAIN AREA */}
       <Box
          sx={{
            flexGrow: 1
          }}
        >

          {/* TOPBAR */}
          {!isMobile && (
            <Topbar
              toggleDarkMode={() => setDarkMode(!darkMode)}
              darkMode={darkMode}
              plantation={plantation}
              setPlantation={setPlantation}
              setPage={setPage}
            />
          )}

          {/* SPACE FOR FIXED TOPBAR */}
          {!isMobile && <Toolbar />}

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
                  <Employees plantation={plantation} />
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
                  <Payslips plantation={plantation} />
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
                  <Attendance plantation={plantation} />
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
                  <Payroll plantation={plantation} />
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
                  <Allowance plantation={plantation} />
                </motion.div>
              )}

              {page === "plantation" && (
                <motion.div
                  key="plantation"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <PlantationPayroll setPage={setPage} plantation={plantation}/>
                </motion.div>
              )}

              {page === "rubbertappers" && (
                <motion.div
                  key="rubbertappers"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <RubberTappers plantation={plantation} />
                </motion.div>
              )}

              {page === "teacollection" && (
                <motion.div
                  key="teacollection"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <TeaCollection plantation={plantation} />
                </motion.div>
              )}
 
              {page === "rubberdispatch" && (
                <motion.div
                  key="rubberdispatch"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <RubberDispatch plantation={plantation} />
                </motion.div>
              )}

              {page === "casualworkers" && (
                <motion.div
                  key="casualworkers"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                 <CasualWorkers plantation={plantation} />
                </motion.div>
              )}

              {page === "income" && (
                <motion.div
                  key="income"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity:1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                <Income plantation={plantation} />
                </motion.div>
              )}

              {page === "expenditure" && (
                <motion.div
                  key="expenditure"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity:1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                <Expenditure plantation={plantation} />
                </motion.div>
              )}

               {page === "financialdashboard" && (
                <motion.div
                  key="financialdashboard"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity:1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                <FinancialDashboard plantation={plantation} />
                </motion.div>
              )}

              {page === "ingurupaththala" && (
                <motion.div
                  key="ingurupaththala"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
                  <IngurupaththalaDashboard />
                </motion.div>
              )}

              {page === "cinnamoncollection" && (
                <motion.div
                  key="ingurupaththala"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
              <CinnamonCollection plantation={plantation} />
              </motion.div>
            )}

            {page === "coconutcollection" && (
                <motion.div
                  key="ingurupaththala"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.4 }}
                >
              <CoconutCollection plantation={plantation} />
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
import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HailIcon from '@mui/icons-material/Hail';
import YardIcon from '@mui/icons-material/Yard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ParkIcon from '@mui/icons-material/Park';
import GroupWorkIcon from '@mui/icons-material/GroupWork'; 
import GrassIcon from '@mui/icons-material/Grass';


const drawerWidth = 240;

export default function Sidebar({ setPage, currentPage, plantation }) {

  const isMobile = useMediaQuery("(max-width:900px)");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menu = [
    { label: "Employees", value: "employees", icon: <PeopleIcon /> },
    { label: "Allowance", value: "allowance", icon: <AccountBalanceWalletIcon /> },
    { label: "Payslips", value: "payslips", icon: <ReceiptIcon /> },
    { label: "Attendance Register", value: "attendanceregister", icon: <EventIcon />},
    { label: "Plantation Payroll", value: "plantation", icon: <AgricultureIcon /> },
    { label: "Rubber Tappers", value:"rubbertappers", icon: <HailIcon />},
    { label: "Tea Collection", value:"teacollection", icon: <YardIcon />},
    { label: "Cinnamon Collection", value:"cinnamoncollection", icon: <ParkIcon />},
      ...(plantation === "ingurupaththala"
    ? [
        {
          label: "Coconut Collection",
          value: "coconutcollection",
          icon: <GroupWorkIcon />
        },
        {
          label: "Paddy Collection",
          value: "paddycollection",
          icon: <GrassIcon />
        }
      ]
    : []),
    { label: "DPL Dispatch", value:"rubberdispatch", icon: <LocalShippingIcon />},
    { label: "Income", value: "income", icon: <TrendingUpIcon />},
    { label: "Expenditure", value: "expenditure", icon: <TrendingDownIcon />},
    { label: "Financial Dashboard", value: "financialdashboard", icon: <AccountBalanceWalletIcon />}

  ];

  const drawerContent = (
  <>

    <Toolbar />

    <Box sx={{ px: 3, mb: 2 }}>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          letterSpacing: 1,
          color: "#fff",
          paddingTop: 5,
          paddingBottom: 5,
          fontSize: {
            xs: "1rem",
            md: "1.25rem"
          }
        }}
      >
        ⚡ {
          plantation === "ingurupaththala"
            ? "Ingurupaththala Plantation Payroll System"
            : "Nirmalani Plantation Payroll System"
        } ⚡
      </Typography>

    </Box>

    <List>

      {menu.map((item) => (

        <ListItem
          key={item.value}
          disablePadding
        >

          <ListItemButton
            onClick={() => {

              setPage(item.value);

              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: 2,
              transition: "0.2s",

              background:
                currentPage === item.value
                  ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                  : "transparent",

              '&:hover': {
                background: "rgba(255,255,255,0.08)",
                transform: "translateX(5px)"
              }
            }}
          >

            <Box
              sx={{
                mr: 2,
                color:
                  currentPage === item.value
                    ? "#fff"
                    : "#9ca3af"
              }}
            >
              {item.icon}
            </Box>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight:
                  currentPage === item.value
                    ? 600
                    : 400
              }}
            />

          </ListItemButton>

        </ListItem>
      ))}

    </List>

  </>
);

return (
  <>

    {/* MOBILE TOP BAR */}
    {isMobile && (

      <Box
        sx={{
          height: 60,
          display: "flex",
          alignItems: "center",
          px: 2,
          background:
            "linear-gradient(180deg, #0f172a, #020617)",

          position: "sticky",
          top: 0,
          zIndex: 1200
        }}
      >

        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: "#fff" }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          sx={{
            color: "#fff",
            ml: 2,
            fontWeight: 700
          }}
        >
          {plantation === "nirmalani"
            ? "Nirmalani Payroll"
            : "Ingurupaththala Payroll"}
        </Typography>

      </Box>
    )}

    {/* SIDEBAR */}
    <Drawer

      variant={isMobile ? "temporary" : "permanent"}

      open={isMobile ? mobileOpen : true}

      onClose={handleDrawerToggle}

      ModalProps={{
        keepMounted: true
      }}

      sx={{
        width: drawerWidth,
        flexShrink: 0,

        [`& .MuiDrawer-paper`]: {

          width: drawerWidth,

          boxSizing: 'border-box',

          background:
            "linear-gradient(180deg, #0f172a, #020617)",

          color: "#fff",

          borderRight:
            "1px solid rgba(255,255,255,0.05)"
        },
      }}
    >

      {drawerContent}

    </Drawer>

  </>
);
}
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Toolbar,
  Typography,
  Box
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const drawerWidth = 240;

export default function Sidebar({ setPage, currentPage }) {

  const menu = [
    { label: "Employees", value: "employees", icon: <PeopleIcon /> },
    { label: "Attendance", value: "attendance", icon: <EventIcon /> },
    { label: "Allowance", value: "allowance", icon: <AccountBalanceWalletIcon /> },
    { label: "Payroll", value: "payroll", icon: <PaymentsIcon /> },
    { label: "Payslips", value: "payslips", icon: <ReceiptIcon /> }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: "linear-gradient(180deg, #0f172a, #020617)",
          color: "#fff",
          borderRight: "1px solid rgba(255,255,255,0.05)"
        },
      }}
    >

      <Toolbar />

      {/* LOGO / TITLE */}
      <Box sx={{ px: 3, mb: 2 }}>
        <Typography variant="h6" sx={{
          fontWeight: 800,
          letterSpacing: 1,
          color: "#fff",
          paddingTop: 5,
          paddingBottom: 5
        }}>
          ⚡ Nirmalani Plantation Payroll System⚡
        </Typography>
      </Box>

      <List>
        {menu.map((item) => (
          <ListItem key={item.value} disablePadding>

            <ListItemButton
              onClick={() => setPage(item.value)}
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

              {/* ICON */}
              <Box sx={{
                mr: 2,
                color: currentPage === item.value ? "#fff" : "#9ca3af"
              }}>
                {item.icon}
              </Box>

              {/* TEXT */}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: currentPage === item.value ? 600 : 400
                }}
              />

            </ListItemButton>

          </ListItem>
        ))}
      </List>

    </Drawer>
  );
}
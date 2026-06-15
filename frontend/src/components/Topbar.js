import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function Topbar({
  toggleDarkMode,
  darkMode,
  plantation,
  setPlantation,
  setPage
}) {

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1201,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(15px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <Toolbar>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: "#fff"
          }}
        >
          {plantation === "nirmalani"
            ? "⚡ Nirmalani Plantation Payroll System"
            : "🌿 Ingurupaththala Plantation Payroll System"}
        </Typography>

        <Button
          variant="contained"
          onClick={() => {
            if (plantation === "nirmalani") {
              setPlantation("ingurupaththala");
              setPage("ingurupaththala");
            } else {
              setPlantation("nirmalani");
              setPage("employees"); 
            }
          }}
        >
          {plantation === "nirmalani"
            ? "🌿 Switch to Ingurupaththala"
            : "⚡ Switch to Nirmalani"}
        </Button>

        <IconButton
          onClick={toggleDarkMode}
          sx={{
            color: "#fff",
            background: "rgba(255,255,255,0.05)",

            "&:hover": {
              background: "rgba(255,255,255,0.15)",
              transform: "scale(1.1)"
            }
          }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

      </Toolbar>
    </AppBar>
  );
}
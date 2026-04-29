import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box
} from '@mui/material';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function Topbar({ toggleDarkMode, darkMode }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1201,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(15px)", // ✅ correct place
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        transition: "0.3s"
      }}
    >
      <Toolbar>

        {/* TITLE */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#fff"
          }}
        >
          ⚡ Payroll System
        </Typography>

        {/* DARK MODE BUTTON */}
        <Box>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              color: "#fff",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              transition: "0.2s",

              "&:hover": {
                background: "rgba(255,255,255,0.15)",
                transform: "scale(1.1)" // 🔥 extra polish
              }
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
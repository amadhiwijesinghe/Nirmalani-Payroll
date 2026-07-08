import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: colors.primary,
    },

    secondary: {
      main: colors.secondary,
    },

    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },

    success: {
      main: colors.success,
    },

    warning: {
      main: colors.warning,
    },

    error: {
      main: colors.error,
    },

    info: {
      main: colors.info,
    },
  },

  typography,

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },
  },
});

export default theme;
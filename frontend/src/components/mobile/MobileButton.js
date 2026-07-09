import { Button } from "@mui/material";

export default function MobileButton({
  children,
  color = "primary",
  icon = null,
  onClick,
  fullWidth = true,
  type = "button",
  disabled = false,
}) {
  const colors = {
    primary: {
      background: "linear-gradient(135deg,#22c55e,#4ade80)",
      color: "#000",
    },
    warning: {
      background: "linear-gradient(135deg,#facc15,#f59e0b)",
      color: "#000",
    },
    danger: {
      background: "linear-gradient(135deg,#ef4444,#f87171)",
      color: "#fff",
    },
    secondary: {
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
    },
  };

  return (
    <Button
        type={type}
        fullWidth={fullWidth}
        disabled={disabled}
        onClick={onClick}
        startIcon={icon}
        sx={{
            minHeight: 56,

            borderRadius: 3,

            px: 3,

            fontSize: "0.95rem",

            fontWeight: 700,

            textTransform: "none",

            whiteSpace: "nowrap",

            transition: "all .25s ease",

            ...colors[color],

            "&:hover": {
            transform: "translateY(-2px)",
            opacity: 0.95,
            },
        }}
        >
        {children}
        </Button>
  );
}
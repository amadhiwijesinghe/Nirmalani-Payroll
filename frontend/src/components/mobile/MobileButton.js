import { Button } from "@mui/material";

export default function MobileButton({
  children,
  color = "primary",
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
      sx={{
        height: {
          xs: 48,
          md: 52,
        },
        borderRadius: 3,
        fontWeight: 700,
        textTransform: "none",
        transition: "0.25s",

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
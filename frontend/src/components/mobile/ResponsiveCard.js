import { Paper } from "@mui/material";

export default function ResponsiveCard({ children, sx = {} }) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          sm: 3
        },
        mb: 3,
        borderRadius: 4,

        background: "rgba(255,255,255,0.05)",

        backdropFilter: "blur(20px)",

        border: "1px solid rgba(255,255,255,0.08)",

        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",

        ...sx
      }}
    >
      {children}
    </Paper>
  );
}
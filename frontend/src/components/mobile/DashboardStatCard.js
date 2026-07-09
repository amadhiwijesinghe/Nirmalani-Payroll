import { Typography } from "@mui/material";
import ResponsiveCard from "./ResponsiveCard";

export default function DashboardStatCard({
  title,
  value,
  color = "#22c55e"
}) {
  return (
    <ResponsiveCard
      sx={{
        borderLeft: `5px solid ${color}`,
        transition: "0.25s",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 15px 40px ${color}33`,
        },
      }}
    >
      <Typography
        sx={{
          color: "#94a3b8",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 2,
          color,
          fontWeight: 800,
          fontSize: {
            xs: "1.8rem",
            md: "2.3rem",
          },
        }}
      >
        {value}
      </Typography>
    </ResponsiveCard>
  );
}
import { Typography, Box } from "@mui/material";

export default function MobileHeader({
  title,
  subtitle
}) {
  return (
    <Box
      sx={{
        mb: 3
      }}
    >
      <Typography
        sx={{
          color: "#fff",

          fontWeight: 800,

          fontSize: {
            xs: "1.6rem",
            sm: "2rem",
            md: "2.5rem"
          }
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            color: "#94a3b8",

            mt: 0.5,

            fontSize: {
              xs: "0.9rem",
              md: "1rem"
            }
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
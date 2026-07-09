import { Box } from "@mui/material";

export default function MobilePage({ children }) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: {
          xs: 1,
          sm: 2,
          md: 3
        },
        py: {
          xs: 1,
          sm: 2,
          md: 3
        }
      }}
    >
      {children}
    </Box>
  );
}
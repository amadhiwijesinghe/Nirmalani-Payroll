import { Box } from "@mui/material";

export default function ResponsiveTable({ children }) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        width: "100%",

        "& table": {
          minWidth: 700
        },

        "&::-webkit-scrollbar": {
          height: 8
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#475569",
          borderRadius: 20
        }
      }}
    >
      {children}
    </Box>
  );
}
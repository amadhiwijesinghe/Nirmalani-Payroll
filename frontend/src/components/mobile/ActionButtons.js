import { Box } from "@mui/material";
import MobileButton from "./MobileButton";

export default function ActionButtons({
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexDirection: {
          xs: "column",
          sm: "row",
        },
      }}
    >
      {showEdit && (
        <MobileButton
          color="warning"
          fullWidth={false}
          onClick={onEdit}
        >
          Edit
        </MobileButton>
      )}

      {showDelete && (
        <MobileButton
          color="danger"
          fullWidth={false}
          onClick={onDelete}
        >
          Delete
        </MobileButton>
      )}
    </Box>
  );
}
import { TextField } from "@mui/material";

export default function MobileInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  ...props
}) {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      type={type}
      onChange={onChange}
      fullWidth
      variant="outlined"
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          backgroundColor: "background.paper",

          "& fieldset": {
            borderColor: "rgba(255,255,255,0.08)",
          },

          "&:hover fieldset": {
            borderColor: "primary.main",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
            borderWidth: 2,
          },
        },

        "& .MuiInputLabel-root": {
          color: "text.secondary",
        },

        "& .MuiInputBase-input": {
          color: "text.primary",
        },
      }}
    />
  );
}
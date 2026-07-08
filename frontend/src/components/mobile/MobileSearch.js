import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import MobileInput from "./MobileInput";

export default function MobileSearch({
  value,
  onChange,
  placeholder = "Search..."
}) {
  return (
    <MobileInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="primary" />
          </InputAdornment>
        ),
      }}
    />
  );
}
/**
 * Reusable table styles for DataGrid components
 * Provides consistent modern UI with theme support across all pages
 */

export const getTableStyles = (theme, darkMode, sidenavColor = "warning") => ({
  border: "none",
  borderRadius: "12px",
  "& .MuiDataGrid-cell": {
    borderBottom: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f0f2f5",
    color: darkMode ? "#fff" : "inherit",
    fontSize: "0.875rem",
  },
  "& .MuiDataGrid-columnHeaders": {
    background: theme.palette.gradients[sidenavColor]?.main 
      ? `linear-gradient(195deg, ${theme.palette.gradients[sidenavColor].main}, ${theme.palette.gradients[sidenavColor].state})`
      : darkMode 
        ? "linear-gradient(195deg, #fb8c00, #ffa726)"
        : "linear-gradient(195deg, #fb8c00, #ffa726)",
    borderBottom: "2px solid rgba(255,255,255,0.1)",
    borderRadius: "12px 12px 0 0",
    fontSize: "0.875rem",
    fontWeight: 700,
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#fff",
      fontWeight: 700,
    },
  },
  "& .MuiDataGrid-row": {
    transition: "all 0.2s ease-in-out",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: darkMode 
        ? "rgba(255,255,255,0.08)" 
        : theme.palette.gradients[sidenavColor]?.main 
          ? `${theme.palette.gradients[sidenavColor].main}15`
          : "rgba(251, 140, 0, 0.08)",
      transform: "scale(1.005)",
      boxShadow: darkMode 
        ? "0 2px 8px rgba(255,255,255,0.1)" 
        : `0 2px 8px ${theme.palette.gradients[sidenavColor]?.main || "rgba(251, 140, 0, 0.3)"}30`,
    },
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: darkMode 
      ? "rgba(255,255,255,0.12)" 
      : theme.palette.gradients[sidenavColor]?.main 
        ? `${theme.palette.gradients[sidenavColor].main}20`
        : "rgba(251, 140, 0, 0.12)",
  },
});

export const getActionButtonStyles = (theme, darkMode, sidenavColor, color = "primary") => ({
  borderRadius: "10px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor: darkMode 
      ? `${theme.palette[color]?.main || theme.palette.gradients[sidenavColor]?.main}30`
      : `${theme.palette[color]?.main || theme.palette.gradients[sidenavColor]?.main}20`,
    boxShadow: `0 4px 12px ${theme.palette[color]?.main || theme.palette.gradients[sidenavColor]?.main}50`,
  },
});

export const getCardStyles = (darkMode) => ({
  overflow: "hidden",
  borderRadius: "16px",
  boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)",
});

export const getPaginationButtonStyles = (theme, darkMode, sidenavColor) => ({
  borderRadius: "10px",
  minWidth: "40px",
  transition: "all 0.2s ease-in-out",
  "&:hover:not(:disabled)": {
    transform: "scale(1.08)",
    boxShadow: `0 4px 12px ${theme.palette.gradients[sidenavColor]?.main || theme.palette.warning.main}40`,
  },
});

export const getExportButtonStyles = (theme, sidenavColor) => ({
  borderRadius: "10px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0 6px 16px ${theme.palette.gradients[sidenavColor]?.main || theme.palette.warning.main}50`,
  },
});

import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import ReportDialog from './ReportDialog';

/**
 * A reusable report button component that can be placed on any content that needs
 * to be reportable (questions, answers, comments, users, events, etc.)
 * 
 * @param {Object} props
 * @param {number} props.targetId - The ID of the content being reported
 * @param {string} props.targetType - The type of content being reported (QUESTION, ANSWER, COMMENT, USER, EVENT)
 * @param {string|object} [props.iconColor="action"] - The color of the flag icon
 * @param {string|object} [props.tooltipPlacement="top"] - The placement of the tooltip
 * @param {object} [props.sx] - Additional styles to apply to the IconButton
 */
const ReportButton = ({ 
  targetId, 
  targetType, 
  variant = "outlined", 
  size = "small", 
  color = "inherit",
  tooltipPlacement = "top",
  sx = {} 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReportClick = (e) => {
    e.stopPropagation(); // Prevents the click from affecting parent elements
    setDialogOpen(true);
  };

  return (
    <>
      <Tooltip title="Report" placement={tooltipPlacement}>
        <IconButton
          aria-label="report"
          onClick={handleReportClick}
          variant={variant}
          size={size}
          color={color}
          sx={{ 
            '&:hover': { 
              color: 'error.main' 
            },
            ...sx
          }}
        >
          <FlagIcon fontSize="small" color={color} />
        </IconButton>
      </Tooltip>

      <ReportDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        targetId={targetId}
        targetType={targetType}
      />
    </>
  );
};

export default ReportButton;
import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import ReportDialog from './ReportDialog';

/**
 * A button component to be placed at the top of a page to allow reporting content
 * 
 * @param {Object} props
 * @param {number} props.targetId - The ID of the content being reported
 * @param {string} props.targetType - The type of content being reported (QUESTION, ANSWER, COMMENT, USER, EVENT)
 * @param {string} [props.variant="outlined"] - The MUI button variant
 * @param {string} [props.size="small"] - The MUI button size
 * @param {string} [props.color="error"] - The MUI button color
 * @param {object} [props.sx] - Additional styles to apply to the Button
 */
const PageReportButton = ({ 
  targetId, 
  targetType, 
  variant = "outlined", 
  size = "small", 
  color = "error",
  sx = {} 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReportClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Tooltip title="Report this content" placement="bottom">
        <Button
          variant={variant}
          size={size}
          color={color}
          startIcon={<FlagIcon />}
          onClick={handleReportClick}
          sx={{ 
            borderRadius: 4,
            ...sx
          }}
        >
          Report
        </Button>
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

export default PageReportButton;
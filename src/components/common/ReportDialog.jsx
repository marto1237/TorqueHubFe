import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ReportService from '../configuration/Services/ReportService';
import ReportTypeService from '../configuration/Services/ReportTypeService';
import ReportReasonService from '../configuration/Services/ReportReasonService';
import UserBanService from '../configuration/Services/UserBanService';
import { useTheme } from '@mui/material/styles';

const ReportDialog = ({ open, onClose, targetId, targetType = 'QUESTION' }) => {
  const [reportTypes, setReportTypes] = useState([]);
  const [reportReasons, setReportReasons] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const theme = useTheme();

  // Fetch report types when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingTypes(true);
      ReportTypeService.getAll()
        .then(data => {
          setReportTypes(data);
          // Find the type that matches the targetType (if available)
          const matchingType = data.find(type => type.name === targetType);
          if (matchingType) {
            setSelectedTypeId(matchingType.id);
          }
          setLoadingTypes(false);
        })
        .catch(err => {
          console.error('Failed to load report types:', err);
          setError('Failed to load report types. Please try again later.');
          setLoadingTypes(false);
        });
    }
  }, [open, targetType]);

  // Fetch report reasons when type changes
  useEffect(() => {
    if (selectedTypeId) {
      setLoadingReasons(true);
      setSelectedReasonId('');
      ReportReasonService.getByTypeId(selectedTypeId)
        .then(data => {
          setReportReasons(data);
          setLoadingReasons(false);
        })
        .catch(err => {
          console.error('Failed to load report reasons:', err);
          setError('Failed to load report reasons. Please try again later.');
          setLoadingReasons(false);
        });
    } else {
      setReportReasons([]);
    }
  }, [selectedTypeId]);

  const handleSubmit = () => {
    if (!selectedTypeId || !selectedReasonId) {
      setError('Please select both a report type and reason.');
      return;
    }

    // Check if user is logged in
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (!jwtToken) {
      setError('You need to be logged in to submit a report.');
      return;
    }

    setLoading(true);
    setError('');

    const reportData = {
      targetId,
      targetType,
      typeId: selectedTypeId,
      reasonId: selectedReasonId,
      details: details.trim() || null
    };

    console.log('Submitting report data:', reportData);

    ReportService.createReport(reportData)
      .then(() => {
        setLoading(false);
        setSuccessMessage('Report submitted successfully. Thank you for helping keep our community safe.');
        setShowSuccessSnackbar(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      })
      .catch(err => {
        setLoading(false);
        console.error('Error submitting report:', err);
        
        if (err.response && err.response.status === 429) {
          setError('You have submitted too many reports recently. Please try again later.');
        } else if (err.response && err.response.status === 401) {
          setError('Authentication error. Please log in again and try once more.');
        } else {
          setError('Error submitting report. Please try again later.');
        }
      });
  };

  const handleClose = () => {
    setSelectedTypeId('');
    setSelectedReasonId('');
    setDetails('');
    setError('');
    setSuccessMessage('');
    setShowSuccessSnackbar(false);
    onClose();
  };

  const handleSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  // Get selected type name for display
  const getSelectedTypeName = () => {
    if (!reportTypes.length || !selectedTypeId) return targetType;
    const selectedType = reportTypes.find(type => type.id === selectedTypeId);
    return selectedType ? selectedType.name : targetType;
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: theme => theme.palette.background.default,
          color: theme.palette.text.primary,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box display="flex" alignItems="center">
            <FlagIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">Report {targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase()}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ py: 2, mt: 1 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError('')}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setSuccessMessage('')}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {successMessage}
            </Alert>
          )}
          
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Help us understand what's wrong with this content. Your report will be reviewed by our moderation team.
            </Typography>
          </Box>
          
          {/* Display report type as static text instead of disabled dropdown */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Report Type: {getSelectedTypeName()}
          </Typography>
          
          <FormControl fullWidth margin="normal" disabled={loadingReasons || !selectedTypeId}>
            <InputLabel>Report Reason</InputLabel>
            <Select
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              label="Report Reason"
            >
              {loadingReasons ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </MenuItem>
              ) : (
                reportReasons.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.name.replace(/_/g, ' ')}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <TextField
            label="Additional Details (Optional)"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            variant="filled"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please provide any additional context that will help us understand the issue..."
            inputProps={{ maxLength: 2000 }}
            helperText={`${details.length}/2000 characters`}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading || !selectedTypeId || !selectedReasonId}
            startIcon={loading ? <CircularProgress size={20} /> : <ReportProblemIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ReportDialog;
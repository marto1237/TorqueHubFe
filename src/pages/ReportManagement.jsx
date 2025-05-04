import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Pagination,
    Chip,
    Avatar,
    Divider,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    Check,
    Close,
    Description,
    History,
    Flag as FlagIcon,
    Person,
    QuestionAnswer,
    Comment,
    Image,
    Event,
    Settings,
    Delete as DeleteIcon,
    Block as BlockIcon,
    Visibility as VisibilityIcon,
    Warning as WarningIcon,
    AccessTime as TimeoutIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ReportService from '../components/configuration/Services/ReportService';
import ReportStatusService from '../components/configuration/Services/ReportStatusService';
import ReportReasonService from '../components/configuration/Services/ReportReasonService';
import ReportTypeService from '../components/configuration/Services/ReportTypeService';
import ModerationLogService from '../components/configuration/Services/ModerationLogService';
import { useAppNotifications } from '../components/common/NotificationProvider';
import ModerationActionTypeService from '../components/configuration/Services/ModerationActionTypeService';
import UserBanService from '../components/configuration/Services/UserBanService';

const ReportManagement = () => {
    const [tabValue, setTabValue] = useState(0);
    const [reports, setReports] = useState([]);
    const [reportStatuses, setReportStatuses] = useState([]);
    const [reportReasons, setReportReasons] = useState([]);
    const [reportTypes, setReportTypes] = useState([]);
    const [moderationActionTypes, setModerationActionTypes] = useState([]);
    const [selectedActionType, setSelectedActionType] = useState('');
    const [banDuration, setBanDuration] = useState(0);
    const [showBanOptions, setShowBanOptions] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [actionText, setActionText] = useState('');
    const [actionStatus, setActionStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [moderationLogs, setModerationLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const theme = useTheme();
    const notifications = useAppNotifications();

    // Define tab to status mapping
    const tabToStatus = {
        0: null, // All reports
        1: 'PENDING',
        2: 'REVIEWED',
        3: 'ACTION_TAKEN',
        4: 'DISMISSED'
    };

    // Fetch all report statuses on mount
    useEffect(() => {
        fetchReportStatuses();
        fetchReportReasons();
        fetchReportTypes();
        fetchModerationActionTypes();
    }, []);

    // Fetch reports based on the selected tab
    useEffect(() => {
        if (tabValue === 0) {
            fetchAllReports();
        } else {
            const statusName = tabToStatus[tabValue];
            if (statusName) {
                fetchReportsByStatus(statusName);
            } else {
                fetchAllReports();
            }
        }
    }, [tabValue, page]);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const response = await ReportService.getAllReports(page);
            setReports(Array.isArray(response) ? response : 
                      (response && response.content) ? response.content : []);
            setTotalPages((response && response.totalPages) ? response.totalPages : 1);
        } catch (error) {
            console.error('Error fetching reports:', error);
            notifications.show('Error fetching reports', {
                autoHideDuration: 3000,
                severity: 'error',
            });
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportsByStatus = async (statusName) => {
        setLoading(true);
        try {
            const response = await ReportService.getReportsByStatus(statusName, page);
            setReports(Array.isArray(response) ? response : 
                      (response && response.content) ? response.content : []);
            setTotalPages((response && response.totalPages) ? response.totalPages : 1);
        } catch (error) {
            console.error(`Error fetching ${statusName} reports:`, error);
            notifications.show(`Error fetching ${statusName} reports`, {
                autoHideDuration: 3000,
                severity: 'error',
            });
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportStatuses = async () => {
        try {
            const response = await ReportStatusService.getAll();
            console.log('Report statuses response:', response);
            setReportStatuses(Array.isArray(response) ? response : 
                             (response && response.content) ? response.content : []);
        } catch (error) {
            console.error('Error fetching report statuses:', error);
            setReportStatuses([]);
        }
    };

    const fetchReportReasons = async () => {
        try {
            const response = await ReportReasonService.getAll();
            setReportReasons(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching report reasons:', error);
            setReportReasons([]);
        }
    };

    const fetchReportTypes = async () => {
        try {
            const response = await ReportTypeService.getAll();
            setReportTypes(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching report types:', error);
            setReportTypes([]);
        }
    };

    const fetchModerationLogs = async (reportId) => {
        setLogsLoading(true);
        try {
            const response = await ModerationLogService.getByReportId(reportId);
            setModerationLogs(
                Array.isArray(response) ? response : 
                (response && response.content && Array.isArray(response.content)) ? response.content : 
                []
            );
        } catch (error) {
            console.error('Error fetching moderation logs:', error);
            notifications.show('Error fetching moderation history', {
                autoHideDuration: 3000,
                severity: 'error',
            });
            setModerationLogs([]);
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchModerationActionTypes = async () => {
        try {
            const response = await ModerationActionTypeService.getAll();
            console.log('Moderation action types response:', response);
            setModerationActionTypes(Array.isArray(response) ? response : 
                                   (response && response.content) ? response.content : []);
        } catch (error) {
            console.error('Error fetching moderation action types:', error);
            setModerationActionTypes([]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handlePageChange = (event, value) => {
        setPage(value - 1);
    };

    const handleOpenDetails = (report) => {
        setSelectedReport(report);
        setOpenDetailsDialog(true);
        fetchModerationLogs(report.id);
    };

    const handleCloseDetails = () => {
        setSelectedReport(null);
        setOpenDetailsDialog(false);
        setModerationLogs([]);
    };

    const handleOpenAction = (report) => {
        setSelectedReport(report);
        setActionStatus(report.statusName || '');
        setActionText('');
        setSelectedActionType('');
        setBanDuration(0);
        setShowBanOptions(false);
        setOpenActionDialog(true);
    };

    const handleCloseAction = () => {
        setSelectedReport(null);
        setActionStatus('');
        setActionText('');
        setSelectedActionType('');
        setBanDuration(0);
        setShowBanOptions(false);
        setOpenActionDialog(false);
    };

    const handleActionTypeChange = (actionType) => {
        setSelectedActionType(actionType);
        
        // Determine if this action type should show ban options
        const banRelatedActions = ['TEMPORARY_BAN', '2_WEEK_BAN'];
        setShowBanOptions(banRelatedActions.includes(actionType));
        
        console.log('Action type selected:', {
            actionType,
            showBanOptions: banRelatedActions.includes(actionType)
        });
    };

    const handleSubmitAction = async () => {
        try {
            // Log the current state of the component before taking action
            console.log('Action state before submission:', {
                selectedReport,
                actionStatus,
                selectedActionType,
                actionText,
                banDuration,
                showBanOptions,
                userDetails: JSON.parse(sessionStorage.getItem('userDetails') || '{}')
            });
    
            // Find status ID from the reportStatuses array
            const selectedStatus = reportStatuses.find(status => status.name === actionStatus);
            
            if (!selectedStatus) {
                console.error('Invalid status - not found in reportStatuses:', { 
                    actionStatus, 
                    availableStatuses: reportStatuses.map(s => s.name) 
                });
                notifications.show(`Invalid status: ${actionStatus}`, {
                    autoHideDuration: 3000,
                    severity: 'error',
                });
                return;
            }
            
            const statusId = selectedStatus.id;
            console.log('Found status ID:', { statusName: actionStatus, statusId });
            
            // Find action type ID from the moderationActionTypes array
            const selectedActionTypeObj = moderationActionTypes.find(type => type.name === selectedActionType);
            
            // If no action type is selected, we can still proceed with just a status update
            const actionTypeId = selectedActionTypeObj?.id;
            
            console.log('Found action type ID:', { 
                actionTypeName: selectedActionType, 
                actionTypeId,
                allActionTypes: moderationActionTypes.map(t => ({ id: t.id, name: t.name }))
            });
    
            if (!actionTypeId && selectedActionType) {
                console.error('Invalid action type - not found in moderationActionTypes:', { 
                    selectedActionType, 
                    availableActionTypes: moderationActionTypes.map(t => t.name) 
                });
                notifications.show(`Invalid action type: ${selectedActionType}`, {
                    autoHideDuration: 3000,
                    severity: 'error',
                });
                return;
            }
    
            // Get the current user details from session storage
            const userDetails = JSON.parse(sessionStorage.getItem('userDetails') || '{}');
            const moderatorId = userDetails.id;
            
            if (!moderatorId) {
                console.error('Moderator ID is missing from userDetails:', userDetails);
                notifications.show('User authentication issue - please log in again', {
                    autoHideDuration: 3000,
                    severity: 'error',
                });
                return;
            }
    
            // Check if this is a user report with a ban action
            const isUserReport = selectedReport.typeName?.toUpperCase() === 'USER';
            const isBanAction = ['PERMANENT_BAN', 'TEMPORARY_BAN', '2_WEEK_BAN'].includes(selectedActionType);
            
            // Special handling for user reports with ban actions
            if (isUserReport && isBanAction && selectedReport.targetId) {
                console.log('Handling user report with ban action');
                
                try {
                    // Call the appropriate ban endpoint based on the action type
                    if (selectedActionType === 'PERMANENT_BAN') {
                        await UserBanService.permanentBan(
                            selectedReport.targetId, 
                            actionText || "Banned due to report", 
                            null, // Let the backend extract the moderator ID from token
                            selectedReport.id // Pass the report ID to update status
                        );
                        console.log('Permanent ban applied successfully');
                    } else {
                        // For temporary bans, calculate the appropriate duration
                        const actualBanDuration = selectedActionType === '2_WEEK_BAN' ? 14 : (banDuration || 7);
                        
                        await UserBanService.temporaryBan(
                            selectedReport.targetId, 
                            actionText || `Temporarily banned for ${actualBanDuration} days due to report`, 
                            actualBanDuration, 
                            null, // Let the backend extract the moderator ID from token
                            selectedReport.id // Pass the report ID to update status
                        );
                        console.log(`Temporary ban (${actualBanDuration} days) applied successfully`);
                    }
                    
                    notifications.show('Ban applied and report status updated successfully', {
                        autoHideDuration: 3000,
                        severity: 'success',
                    });
                    
                    // Refresh the reports list
                    if (tabValue === 0) {
                        fetchAllReports();
                    } else {
                        const statusName = tabToStatus[tabValue];
                        if (statusName) {
                            fetchReportsByStatus(statusName);
                        } else {
                            fetchAllReports();
                        }
                    }
                    
                    handleCloseAction();
                    return;
                    
                } catch (banError) {
                    console.error('Error applying ban:', banError);
                    let errorMessage = 'Unknown error';
                    
                    if (banError.response && banError.response.data) {
                        errorMessage = banError.response.data.message || JSON.stringify(banError.response.data);
                    } else if (banError.message) {
                        errorMessage = banError.message;
                    }
                    
                    notifications.show(`Error applying ban: ${errorMessage}`, {
                        autoHideDuration: 5000,
                        severity: 'error',
                    });
                    
                    return;
                }
            }
            
            // For non-ban actions or non-user reports, proceed with the standard moderation action
            const actionData = {
                reportId: selectedReport.id,
                moderatorId: moderatorId,
                actionTypeId: actionTypeId,
                newStatusId: statusId,
                notes: actionText || '' // Ensure notes is not undefined
            };
    
            // Add ban duration if applicable
            if (showBanOptions && banDuration > 0) {
                actionData.banDuration = banDuration;
            }
    
            // Add the target user ID if this report is about a user
            if (isUserReport && selectedReport.targetId) {
                actionData.targetUserId = selectedReport.targetId;
            }
    
            console.log('Moderation action request data:', actionData);
    
            try {
                const actionResponse = await ReportService.addModerationAction(selectedReport.id, actionData);
                console.log('Moderation action response:', actionResponse);
                
                notifications.show('Moderation action submitted successfully', {
                    autoHideDuration: 3000,
                    severity: 'success',
                });
                
                // Refresh reports list
                if (tabValue === 0) {
                    fetchAllReports();
                } else {
                    const statusName = tabToStatus[tabValue];
                    if (statusName) {
                        fetchReportsByStatus(statusName);
                    } else {
                        fetchAllReports();
                    }
                }
                
                handleCloseAction();
            } catch (actionError) {
                console.error('Error adding moderation action:', actionError);
                console.error('Action error details:', {
                    name: actionError.name,
                    message: actionError.message,
                    response: actionError.response,
                    data: actionError.response?.data
                });
                
                let errorMessage = 'Unknown error';
                if (actionError.response && actionError.response.data) {
                    errorMessage = actionError.response.data.message || JSON.stringify(actionError.response.data);
                } else if (actionError.message) {
                    errorMessage = actionError.message;
                }
                
                notifications.show(`Error adding moderation action: ${errorMessage}`, {
                    autoHideDuration: 5000,
                    severity: 'error',
                });
            }
        } catch (error) {
            console.error('Error in handleSubmitAction:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                response: error.response,
                request: error.request
            });
            
            let errorMessage = 'Unknown error';
            
            if (error.response && error.response.data) {
                console.error('Error response data:', error.response.data);
                errorMessage = error.response.data.message || error.response.data;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            notifications.show(`Error: ${errorMessage}`, {
                autoHideDuration: 5000,
                severity: 'error',
            });
        }
    }; 

    const getReportTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'question':
                return <QuestionAnswer />;
            case 'answer':
                return <Description />;
            case 'comment':
                return <Comment />;
            case 'user':
                return <Person />;
            case 'showcase':
                return <Image />;
            case 'event':
                return <Event />;
            default:
                return <FlagIcon />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return theme.palette.warning.main;
            case 'reviewed':
                return theme.palette.info.main;
            case 'action_taken':
                return theme.palette.success.main;
            case 'dismissed':
                return theme.palette.error.dark;
            default:
                return theme.palette.grey[500];
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getReportedContentURL = (report) => {
        if (!report) return '#';
        
        const { typeName, targetId } = report;
        
        switch (typeName?.toUpperCase()) {
            case 'QUESTION':
                return `/questions/${targetId}`;
            case 'ANSWER':
                return `/answers/${targetId}`;
            case 'COMMENT':
                return `/comments/${targetId}`;
            case 'USER':
                return `/users/profile/${targetId}`;
            case 'SHOWCASE':
                return `/showcase/${targetId}`;
            default:
                return '#';
        }
    };

    return (
        <Box 
            sx={{
                padding: '20px',
                paddingTop: '100px',
                backgroundColor: 'background.paper',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                Report Management
            </Typography>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    textColor="primary"
                    indicatorColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="All Reports" />
                    <Tab label="Pending" />
                    <Tab label="Reviewed" />
                    <Tab label="Action Taken" />
                    <Tab label="Dismissed" />
                </Tabs>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : reports.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="h6">No reports found</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {reports.map((report) => (
                        <Grid item xs={12} sm={6} md={4} key={report.id}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {getReportTypeIcon(report.typeName)}
                                            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                {report.typeName || 'Unknown Type'}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={report.statusName || 'Unknown'} 
                                            size="small"
                                            sx={{ 
                                                backgroundColor: getStatusColor(report.statusName),
                                                color: 'white'
                                            }}
                                        />
                                    </Box>
                                    
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        <strong>Reason:</strong> {report.reasonName || 'Not specified'}
                                    </Typography>
                                    
                                    <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                                        {report.details?.substring(0, 100)}{report.details?.length > 100 ? '...' : ''}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Reported by: {report.reporterUsername || 'Anonymous'}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Reported on: {formatDate(report.createdAt)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        onClick={() => handleOpenDetails(report)}
                                        startIcon={<Description />}
                                    >
                                        Details
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => handleOpenAction(report)}
                                        startIcon={<Settings />}
                                    >
                                        Take Action
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                    count={totalPages} 
                    page={page + 1} 
                    onChange={handlePageChange} 
                    color="primary" 
                />
            </Box>

            {/* Report Details Dialog */}
            <Dialog open={openDetailsDialog} onClose={handleCloseDetails} fullWidth maxWidth="md">
                <DialogTitle>
                    Report Details
                </DialogTitle>
                <DialogContent dividers>
                    {selectedReport && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Report Information</Typography>
                                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle1">
                                        <strong>Type:</strong> {selectedReport.typeName}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Reason:</strong> {selectedReport.reasonName}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Status:</strong> {selectedReport.statusName}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Target:</strong> {selectedReport.targetName} (ID: {selectedReport.targetId})
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Created At:</strong> {formatDate(selectedReport.createdAt)}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        <strong>Updated At:</strong> {formatDate(selectedReport.updatedAt)}
                                    </Typography>
                                </Card>

                                <Typography variant="h6" gutterBottom>Reporter</Typography>
                                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2 }}>
                                            {selectedReport.reporterUsername?.[0]?.toUpperCase() || 'A'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">{selectedReport.reporterUsername || 'Anonymous'}</Typography>
                                            <Typography variant="body2" color="textSecondary">ID: {selectedReport.reporterId}</Typography>
                                        </Box>
                                    </Box>
                                </Card>

                                <Typography variant="h6" gutterBottom>Description</Typography>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body1">{selectedReport.details}</Typography>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>Moderation History</Typography>
                                <Card variant="outlined" sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
                                    {logsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : (!Array.isArray(moderationLogs) || moderationLogs.length === 0) ? (
                                        <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                                            No moderation actions taken yet
                                        </Typography>
                                    ) : (
                                        moderationLogs.map((log, index) => (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                                        {log.moderatorUsername?.[0]?.toUpperCase() || 'M'}
                                                    </Avatar>
                                                    <Typography variant="subtitle2">{log.moderatorUsername || 'Unknown Moderator'}</Typography>
                                                    <Typography variant="caption" sx={{ ml: 'auto' }}>
                                                        {formatDate(log.createdAt)}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ ml: 5 }}>{log.action}</Typography>
                                                {index < moderationLogs.length - 1 && <Divider sx={{ my: 2 }} />}
                                            </Box>
                                        ))
                                    )}
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails} color="primary">
                        Close
                    </Button>
                    <Button 
                        onClick={() => {
                            handleCloseDetails();
                            handleOpenAction(selectedReport);
                        }} 
                        color="primary" 
                        variant="contained"
                    >
                        Take Action
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Take Action Dialog */}
            <Dialog open={openActionDialog} onClose={handleCloseAction} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Take Action</Typography>
                    {selectedReport && (
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            component="a"
                            href={getReportedContentURL(selectedReport)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Content
                        </Button>
                    )}
                </DialogTitle>
                <DialogContent>
                    {selectedReport && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        value={actionStatus}
                                        onChange={(e) => setActionStatus(e.target.value)}
                                        label="Status"
                                    >
                                        {reportStatuses.map((status) => (
                                            <MenuItem key={status.id} value={status.name}>
                                                {status.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                                    Action Type:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {moderationActionTypes.map((actionType) => {
                                        // Define icon based on action type name
                                        let icon;
                                        let color = "primary";
                                        
                                        switch(actionType.name?.toUpperCase()) {
                                            case 'WARNING':
                                                icon = <WarningIcon />;
                                                color = "warning";
                                                break;
                                            case 'TEMPORARY_BAN':
                                            case '2_WEEK_BAN':
                                                icon = <TimeoutIcon />;
                                                color = "error";
                                                break;
                                            case 'PERMANENT_BAN':
                                                icon = <BlockIcon />;
                                                color = "error";
                                                break;
                                            case 'CONTENT_REMOVAL':
                                                icon = <DeleteIcon />;
                                                color = "error";
                                                break;
                                            case 'NO_ACTION':
                                                icon = <Check />;
                                                color = "primary";
                                                break;
                                            default:
                                                icon = <Settings />;
                                        }
                                        
                                        // Button label - convert snake case to title case
                                        const label = actionType.displayName || 
                                                     actionType.name?.split('_')
                                                     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                     .join(' ');
                                        
                                        return (
                                            <Button
                                                key={actionType.id}
                                                variant={selectedActionType === actionType.name ? "contained" : "outlined"}
                                                color={color}
                                                startIcon={icon}
                                                onClick={() => handleActionTypeChange(actionType.name)}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                {label}
                                            </Button>
                                        );
                                    })}
                                </Box>
                                
                                {showBanOptions && (
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="ban-duration-label">Ban Duration (days)</InputLabel>
                                        <Select
                                            labelId="ban-duration-label"
                                            value={banDuration}
                                            onChange={(e) => setBanDuration(e.target.value)}
                                            label="Ban Duration (days)"
                                        >
                                            <MenuItem value={1}>1 day</MenuItem>
                                            <MenuItem value={3}>3 days</MenuItem>
                                            <MenuItem value={7}>1 week</MenuItem>
                                            <MenuItem value={14}>2 weeks</MenuItem>
                                            <MenuItem value={30}>1 month</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Action Notes"
                                    multiline
                                    rows={10}
                                    margin="normal"
                                    variant="filled"
                                    value={actionText}
                                    onChange={(e) => setActionText(e.target.value)}
                                    placeholder="Describe the action taken and why..."
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'background.paper', 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Report Summary
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Type:</strong> {selectedReport.typeName} | 
                                        <strong> Reason:</strong> {selectedReport.reasonName} | 
                                        <strong> Target:</strong> {selectedReport.targetName}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAction} startIcon={<Close />}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitAction} 
                        color="primary" 
                        variant="contained"
                        disabled={!actionText.trim() || !actionStatus}
                        startIcon={<Check />}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportManagement; 
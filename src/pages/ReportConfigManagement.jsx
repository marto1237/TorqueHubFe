import React, { useState, useEffect } from 'react';
import {
    Box, 
    Typography, 
    Tabs, 
    Tab, 
    Paper, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton, 
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ReportStatusService from '../components/configuration/Services/ReportStatusService';
import ReportReasonService from '../components/configuration/Services/ReportReasonService';
import ReportTypeService from '../components/configuration/Services/ReportTypeService';
import { useAppNotifications } from '../components/common/NotificationProvider';

const ReportConfigManagement = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [types, setTypes] = useState([]);
    const [actionTypes, setActionTypes] = useState([]);
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [dialogAction, setDialogAction] = useState('add'); // 'add' or 'edit'
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Form fields
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTypeId, setFormTypeId] = useState('');
    
    const theme = useTheme();
    const notifications = useAppNotifications();

    useEffect(() => {
        // Load data based on active tab
        loadTabData(tabValue);
    }, [tabValue]);

    const loadTabData = (tab) => {
        setLoading(true);
        switch(tab) {
            case 0: // Report Statuses
                fetchReportStatuses();
                break;
            case 1: // Report Types
                fetchReportTypes();
                break;
            case 2: // Report Reasons
                fetchReportReasons();
                break;
            case 3: // Moderation Action Types
                fetchModerationActionTypes();
                break;
            default:
                setLoading(false);
        }
    };

    const fetchReportStatuses = async () => {
        try {
            const response = await ReportStatusService.getAll();
            setStatuses(response.content || []);
        } catch (error) {
            console.error('Error fetching report statuses:', error);
            notifications.show('Error fetching report statuses', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchReportTypes = async () => {
        try {
            const response = await ReportTypeService.getAll();
            setTypes(response || []);
        } catch (error) {
            console.error('Error fetching report types:', error);
            notifications.show('Error fetching report types', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchReportReasons = async () => {
        try {
            const response = await ReportReasonService.getAll();
            setReasons(response || []);
        } catch (error) {
            console.error('Error fetching report reasons:', error);
            notifications.show('Error fetching report reasons', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchModerationActionTypes = async () => {
        try {
            // This would be replaced with actual service call when API is available
            // For now, using mock data
            setActionTypes([
                { id: 1, name: 'WARNING', description: 'Issue a warning to the user' },
                { id: 2, name: 'TEMPORARY_BAN', description: 'Temporarily ban the user' },
                { id: 3, name: 'PERMANENT_BAN', description: 'Permanently ban the user' },
                { id: 4, name: '2_WEEK_BAN', description: 'Two week temporary ban' },
                { id: 5, name: 'TIMEOUT', description: 'Short timeout period' },
                { id: 6, name: 'CONTENT_REMOVAL', description: 'Remove the reported content' },
                { id: 7, name: 'NO_ACTION', description: 'No action taken' }
            ]);
        } catch (error) {
            console.error('Error fetching moderation action types:', error);
            notifications.show('Error fetching moderation action types', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenAddDialog = (type) => {
        setDialogType(type);
        setDialogAction('add');
        setFormName('');
        setFormDescription('');
        setFormTypeId('');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (type, item) => {
        setDialogType(type);
        setDialogAction('edit');
        setSelectedItem(item);
        setFormName(item.name || '');
        setFormDescription(item.description || '');
        setFormTypeId(item.reportType?.id || '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
    };

    const handleDeleteItem = async (type, id) => {
        try {
            switch(type) {
                case 'status':
                    await ReportStatusService.delete(id);
                    setStatuses(statuses.filter(status => status.id !== id));
                    break;
                case 'type':
                    await ReportTypeService.delete(id);
                    setTypes(types.filter(t => t.id !== id));
                    break;
                case 'reason':
                    await ReportReasonService.delete(id);
                    setReasons(reasons.filter(reason => reason.id !== id));
                    break;
                case 'actionType':
                    // This would be replaced with actual service call when API is available
                    setActionTypes(actionTypes.filter(action => action.id !== id));
                    break;
                default:
                    return;
            }
            
            notifications.show('Item deleted successfully', {
                autoHideDuration: 3000,
                severity: 'success',
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            notifications.show('Error deleting item', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    const handleSubmitDialog = async () => {
        if (!formName.trim()) {
            notifications.show('Name is required', {
                autoHideDuration: 3000,
                severity: 'warning',
            });
            return;
        }

        try {
            let response;
            const formData = {
                name: formName,
                description: formDescription
            };

            if (dialogType === 'reason') {
                formData.reportTypeId = formTypeId;
            }

            if (dialogAction === 'add') {
                switch(dialogType) {
                    case 'status':
                        response = await ReportStatusService.create(formData);
                        setStatuses([...statuses, response]);
                        break;
                    case 'type':
                        response = await ReportTypeService.create(formData);
                        setTypes([...types, response]);
                        break;
                    case 'reason':
                        response = await ReportReasonService.create(formData);
                        setReasons([...reasons, response]);
                        break;
                    case 'actionType':
                        // This would be replaced with actual service call when API is available
                        const newAction = {
                            id: actionTypes.length + 1,
                            ...formData
                        };
                        setActionTypes([...actionTypes, newAction]);
                        response = newAction;
                        break;
                    default:
                        break;
                }
            } else { // edit
                switch(dialogType) {
                    case 'status':
                        response = await ReportStatusService.update(selectedItem.id, formData);
                        setStatuses(statuses.map(status => 
                            status.id === selectedItem.id ? response : status
                        ));
                        break;
                    case 'type':
                        response = await ReportTypeService.update(selectedItem.id, formData);
                        setTypes(types.map(type => 
                            type.id === selectedItem.id ? response : type
                        ));
                        break;
                    case 'reason':
                        response = await ReportReasonService.update(selectedItem.id, formData);
                        setReasons(reasons.map(reason => 
                            reason.id === selectedItem.id ? response : reason
                        ));
                        break;
                    case 'actionType':
                        // This would be replaced with actual service call when API is available
                        const updatedAction = {
                            ...selectedItem,
                            ...formData
                        };
                        setActionTypes(actionTypes.map(action => 
                            action.id === selectedItem.id ? updatedAction : action
                        ));
                        response = updatedAction;
                        break;
                    default:
                        break;
                }
            }

            notifications.show(`Item ${dialogAction === 'add' ? 'added' : 'updated'} successfully`, {
                autoHideDuration: 3000,
                severity: 'success',
            });
            
            handleCloseDialog();
        } catch (error) {
            console.error('Error submitting form:', error);
            notifications.show(`Error ${dialogAction === 'add' ? 'adding' : 'updating'} item`, {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    const renderTable = () => {
        switch(tabValue) {
            case 0: // Report Statuses
                return renderStatusTable();
            case 1: // Report Types
                return renderTypeTable();
            case 2: // Report Reasons
                return renderReasonTable();
            case 3: // Moderation Action Types
                return renderActionTypeTable();
            default:
                return null;
        }
    };

    const renderStatusTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {statuses.map((status) => (
                        <TableRow key={status.id}>
                            <TableCell>{status.id}</TableCell>
                            <TableCell>{status.name}</TableCell>
                            <TableCell>{status.description}</TableCell>
                            <TableCell>
                                <IconButton color="primary" onClick={() => handleOpenEditDialog('status', status)}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteItem('status', status.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderTypeTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {types.map((type) => (
                        <TableRow key={type.id}>
                            <TableCell>{type.id}</TableCell>
                            <TableCell>{type.name}</TableCell>
                            <TableCell>{type.description}</TableCell>
                            <TableCell>
                                <IconButton color="primary" onClick={() => handleOpenEditDialog('type', type)}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteItem('type', type.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderReasonTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Report Type</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reasons.map((reason) => (
                        <TableRow key={reason.id}>
                            <TableCell>{reason.id}</TableCell>
                            <TableCell>{reason.name}</TableCell>
                            <TableCell>{reason.description}</TableCell>
                            <TableCell>{reason.reportType?.name || 'N/A'}</TableCell>
                            <TableCell>
                                <IconButton color="primary" onClick={() => handleOpenEditDialog('reason', reason)}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteItem('reason', reason.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderActionTypeTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {actionTypes.map((action) => (
                        <TableRow key={action.id}>
                            <TableCell>{action.id}</TableCell>
                            <TableCell>{action.name}</TableCell>
                            <TableCell>{action.description}</TableCell>
                            <TableCell>
                                <IconButton color="primary" onClick={() => handleOpenEditDialog('actionType', action)}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteItem('actionType', action.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderAddButton = () => {
        let buttonText = '';
        let dialogType = '';
        
        switch(tabValue) {
            case 0:
                buttonText = 'Add Status';
                dialogType = 'status';
                break;
            case 1:
                buttonText = 'Add Type';
                dialogType = 'type';
                break;
            case 2:
                buttonText = 'Add Reason';
                dialogType = 'reason';
                break;
            case 3:
                buttonText = 'Add Action Type';
                dialogType = 'actionType';
                break;
            default:
                return null;
        }
        
        return (
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Add />}
                onClick={() => handleOpenAddDialog(dialogType)}
                sx={{ mb: 2 }}
            >
                {buttonText}
            </Button>
        );
    };

    const renderDialogContent = () => {
        return (
            <>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                />
                {dialogType === 'reason' && (
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Report Type</InputLabel>
                        <Select
                            value={formTypeId}
                            onChange={(e) => setFormTypeId(e.target.value)}
                            label="Report Type"
                        >
                            {types.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </>
        );
    };

    const getDialogTitle = () => {
        const action = dialogAction === 'add' ? 'Add' : 'Edit';
        let itemType = '';
        
        switch(dialogType) {
            case 'status':
                itemType = 'Report Status';
                break;
            case 'type':
                itemType = 'Report Type';
                break;
            case 'reason':
                itemType = 'Report Reason';
                break;
            case 'actionType':
                itemType = 'Moderation Action Type';
                break;
            default:
                itemType = 'Item';
        }
        
        return `${action} ${itemType}`;
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
                Report Configuration Management
            </Typography>
            
            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    textColor="primary"
                    indicatorColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Report Statuses" />
                    <Tab label="Report Types" />
                    <Tab label="Report Reasons" />
                    <Tab label="Moderation Action Types" />
                </Tabs>
            </Paper>
            
            <Box sx={{ mb: 3 }}>
                {renderAddButton()}
            </Box>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                renderTable()
            )}
            
            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{getDialogTitle()}</DialogTitle>
                <DialogContent>
                    {renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitDialog} 
                        color="primary" 
                        variant="contained"
                        startIcon={<Save />}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportConfigManagement; 
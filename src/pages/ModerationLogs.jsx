import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Avatar,
    CircularProgress,
    Chip
} from '@mui/material';
import { Search, Clear, PersonOutline, History } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ModerationLogService from '../components/configuration/Services/ModerationLogService';
import { useAppNotifications } from '../components/common/NotificationProvider';
import { useNavigate } from 'react-router-dom';

const ModerationLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [filterModerator, setFilterModerator] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [moderators, setModerators] = useState([]);

    const theme = useTheme();
    const notifications = useAppNotifications();

    const navigate = useNavigate();

    // Fetch logs on component mount and when page/filters change
    useEffect(() => {
        fetchLogs();
        // In a real implementation, you'd also fetch the list of moderators here
        // For now, this is a placeholder
        setModerators([
            { id: 1, username: 'admin1' },
            { id: 2, username: 'moderator1' },
            { id: 3, username: 'moderator2' },
        ]);
    }, [page, rowsPerPage, filterModerator, filterAction, filterDateFrom, filterDateTo]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // In a real implementation, you'd pass all filters to your API
            // For now, we're just getting logs by page
            // If a moderator filter is applied, we'd use getByModeratorId
            
            let response;
            if (filterModerator) {
                response = await ModerationLogService.getByModeratorId(
                    filterModerator,
                    page,
                    rowsPerPage
                );
            } else {
                // This is a placeholder since we don't have a "getAll" method
                // In a real implementation, you'd have this endpoint
                // response = await ModerationLogService.getAll(page, rowsPerPage);
                
                // For now, we'll simulate a response
                response = {
                    content: generateMockLogs(),
                    totalElements: 50,
                    totalPages: 5
                };
            }
            
            setLogs(response.content || []);
            setTotalElements(response.totalElements || 0);
        } catch (error) {
            console.error('Error fetching moderation logs:', error);
            notifications.show('Error fetching moderation logs', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Generate mock data for demonstration
    const generateMockLogs = () => {
        const mockLogs = [];
        const actions = [
            'Updated report status to CLOSED',
            'Updated report status to IN_PROGRESS',
            'Deleted inappropriate comment',
            'Warned user for violation',
            'Removed spam content'
        ];
        
        for (let i = 0; i < rowsPerPage; i++) {
            const randomModeratorIndex = Math.floor(Math.random() * moderators.length);
            const randomActionIndex = Math.floor(Math.random() * actions.length);
            
            mockLogs.push({
                id: page * rowsPerPage + i + 1,
                action: actions[randomActionIndex],
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                moderator: moderators[randomModeratorIndex],
                reportId: Math.floor(Math.random() * 100) + 1
            });
        }
        
        return mockLogs;
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (filterType, value) => {
        setPage(0); // Reset to first page when applying a filter
        
        switch (filterType) {
            case 'moderator':
                setFilterModerator(value);
                break;
            case 'action':
                setFilterAction(value);
                break;
            case 'dateFrom':
                setFilterDateFrom(value);
                break;
            case 'dateTo':
                setFilterDateTo(value);
                break;
            default:
                break;
        }
    };

    const handleClearFilters = () => {
        setFilterModerator('');
        setFilterAction('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setPage(0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Box 
            sx={{
                padding: '20px',
                paddingTop: '100px',
                backgroundColor: 'background.paper',
                minHeight: '100vh',
            }}
        >
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
                Moderation Logs
            </Typography>
            
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Filter Logs
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Moderator</InputLabel>
                            <Select
                                value={filterModerator}
                                onChange={(e) => handleFilterChange('moderator', e.target.value)}
                                label="Moderator"
                            >
                                <MenuItem value="">
                                    <em>All Moderators</em>
                                </MenuItem>
                                {moderators.map((mod) => (
                                    <MenuItem key={mod.id} value={mod.id}>
                                        {mod.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Action Contains"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={filterAction}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="From Date"
                            type="date"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={filterDateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="To Date"
                            type="date"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={filterDateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<Clear />}
                        onClick={handleClearFilters}
                        sx={{ mr: 1 }}
                    >
                        Clear Filters
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<Search />}
                        onClick={fetchLogs}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Paper>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Moderator</strong></TableCell>
                                    <TableCell><strong>Action</strong></TableCell>
                                    <TableCell><strong>Date & Time</strong></TableCell>
                                    <TableCell><strong>Report ID</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ width: 30, height: 30, mr: 1 }}>
                                                    {log.moderator?.username?.[0]?.toUpperCase() || <PersonOutline />}
                                                </Avatar>
                                                {log.moderator?.username || 'Unknown'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`#${log.reportId}`} 
                                                size="small" 
                                                color="primary"
                                                onClick={() => navigate(`/report-management/report/${log.reportId}`)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                                {logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Box sx={{ py: 3 }}>
                                                <History sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="h6" color="text.secondary">
                                                    No moderation logs found
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={totalElements}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}
        </Box>
    );
};

export default ModerationLogs; 
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    ButtonGroup,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Tooltip,
    IconButton,
    Divider,
    Avatar,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    Payment,
    Group,
    Warning,
    Download,
    Refresh,
    FilterList,
    AccountBalance,
    Speed,
    Assessment,
    Timeline,
    EuroSymbol,
    CreditCard,
    AccountCircle,
    DateRange,
    Close
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ArcElement,
} from 'chart.js';

import RevenueAnalyticsService from '../components/configuration/Services/RevenueAnalyticsService';
import { useAppNotifications } from '../components/common/NotificationProvider';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    ArcElement
);

/**
 * Admin Revenue Dashboard - Comprehensive revenue analytics and insights
 * Only accessible to ADMIN users (protected by RoleProtectedRoute)
 */
const AdminRevenueDashboard = ({ userDetails }) => {
    const theme = useTheme();
    const notifications = useAppNotifications();

    // State for data
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [topDonors, setTopDonors] = useState([]);
    const [breakdown, setBreakdown] = useState({});
    const [failedPayments, setFailedPayments] = useState({});
    const [realtimeData, setRealtimeData] = useState({});

    // State for filters
    const [period, setPeriod] = useState('MONTH');
    const [customDateOpen, setCustomDateOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [filters, setFilters] = useState({
        status: '',
        paymentType: '',
        currency: '',
        minAmount: '',
        maxAmount: ''
    });

    // Load initial data
    useEffect(() => {
        loadDashboardData();
        
        // Set up real-time data refresh
        const interval = setInterval(loadRealtimeData, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [period]);

    /**
     * Apply custom date range
     */
    const handleApplyCustomRange = () => {
        if (!dateRange.startDate || !dateRange.endDate) {
            notifications.show('Please select both start and end dates', { severity: 'warning' });
            return;
        }
        
        setCustomDateOpen(false);
        setPeriod('CUSTOM');
        loadDashboardData();
        notifications.show('Custom date range applied', { severity: 'success' });
    };

    /**
     * Reset to predefined period
     */
    const handlePeriodChange = (newPeriod) => {
        if (newPeriod !== 'CUSTOM') {
            setDateRange({ startDate: '', endDate: '' });
        }
        setPeriod(newPeriod);
    };

    /**
     * Load all dashboard data
     */
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Prepare filters for API calls
            const apiFilters = { ...filters };
            if (period === 'CUSTOM' && dateRange.startDate && dateRange.endDate) {
                apiFilters.startDate = dateRange.startDate;
                apiFilters.endDate = dateRange.endDate;
            }
            
            // Load multiple data sources in parallel
            const [
                summaryResponse,
                overviewResponse,
                trendsResponse,
                donorsResponse,
                breakdownResponse,
                failedResponse,
                realtimeResponse
            ] = await Promise.all([
                RevenueAnalyticsService.getRevenueSummary(period === 'CUSTOM' ? 'ALL_TIME' : period),
                RevenueAnalyticsService.getRevenueOverview(apiFilters),
                RevenueAnalyticsService.getPaymentTrends({ groupBy: 'DAY', ...apiFilters }),
                RevenueAnalyticsService.getTopDonors({ limit: 10, period: period === 'CUSTOM' ? 'ALL_TIME' : period }),
                RevenueAnalyticsService.getRevenueBreakdown({ breakdownType: 'PAYMENT_TYPE', ...apiFilters }),
                RevenueAnalyticsService.getFailedPaymentsAnalysis(apiFilters),
                RevenueAnalyticsService.getRealtimeRevenue()
            ]);

            // Set data if successful
            if (summaryResponse.success) setSummary(summaryResponse.data);
            if (overviewResponse.success) setOverview(overviewResponse.data);
            if (trendsResponse.success) setTrends(trendsResponse.data);
            if (donorsResponse.success) setTopDonors(donorsResponse.data);
            if (breakdownResponse.success) setBreakdown(breakdownResponse.data);
            if (failedResponse.success) setFailedPayments(failedResponse.data);
            if (realtimeResponse.success) setRealtimeData(realtimeResponse.data);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            notifications.show('Failed to load revenue data', { severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load real-time data only
     */
    const loadRealtimeData = async () => {
        try {
            const response = await RevenueAnalyticsService.getRealtimeRevenue();
            if (response.success) {
                setRealtimeData(response.data);
            }
        } catch (error) {
            console.error('Failed to refresh real-time data:', error);
        }
    };

    /**
     * Refresh all data
     */
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
        notifications.show('Dashboard refreshed successfully', { severity: 'success' });
    };

    /**
     * Export revenue data
     */
    const handleExport = async (format = 'JSON') => {
        try {
            const exportFilters = { ...filters };
            if (period === 'CUSTOM' && dateRange.startDate && dateRange.endDate) {
                exportFilters.startDate = dateRange.startDate;
                exportFilters.endDate = dateRange.endDate;
            }
            
            const response = await RevenueAnalyticsService.exportRevenueData({
                format,
                ...exportFilters,
                includeDetails: true
            });

            if (response.success) {
                notifications.show(`Revenue data exported as ${format}`, { severity: 'success' });
                // Handle download logic here - you might want to create a blob and download
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `revenue-export-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            notifications.show('Failed to export data', { severity: 'error' });
        }
    };

    /**
     * Create chart data for trends
     */
    const createTrendChartData = () => {
        if (!trends.length) return { labels: [], datasets: [] };

        return {
            labels: trends.map(t => t.periodLabel || new Date(t.periodStart).toLocaleDateString()),
            datasets: [
                {
                    label: 'Total Revenue',
                    data: trends.map(t => t.totalRevenue || 0),
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Donations',
                    data: trends.map(t => t.donationRevenue || 0),
                    borderColor: theme.palette.success.main,
                    backgroundColor: theme.palette.success.light,
                    tension: 0.4,
                    fill: false
                }
            ]
        };
    };

    /**
     * Create breakdown chart data
     */
    const createBreakdownChartData = () => {
        if (!breakdown || !Object.keys(breakdown).length) return { labels: [], datasets: [] };

        const labels = Object.keys(breakdown);
        const data = Object.values(breakdown);

        return {
            labels: labels.map(label => label.replace('_', ' ').toUpperCase()),
            datasets: [{
                data,
                backgroundColor: [
                    theme.palette.primary.main,
                    theme.palette.secondary.main,
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.main,
                ],
                borderWidth: 2,
                borderColor: theme.palette.background.paper
            }]
        };
    };

    return (
        <Box sx={{ 
            p: 3, 
            pt: 12,
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default
        }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assessment sx={{ mr: 2, fontSize: '2rem' }} />
                        Revenue Analytics Dashboard
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Custom Date Range">
                            <IconButton 
                                onClick={() => setCustomDateOpen(true)}
                                color="primary"
                                variant="outlined"
                            >
                                <DateRange />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Refresh Data">
                            <IconButton 
                                onClick={handleRefresh} 
                                disabled={refreshing}
                                color="primary"
                            >
                                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            </IconButton>
                        </Tooltip>
                        
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleExport('JSON')}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>

                {/* Period Filter */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                        {['TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'ALL_TIME'].map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? 'contained' : 'outlined'}
                                onClick={() => handlePeriodChange(p)}
                            >
                                {p.replace('_', ' ')}
                            </Button>
                        ))}
                    </ButtonGroup>
                    
                    <Button
                        variant={period === 'CUSTOM' ? 'contained' : 'outlined'}
                        startIcon={<DateRange />}
                        onClick={() => setCustomDateOpen(true)}
                        sx={{ mb: 2 }}
                    >
                        Custom Range
                    </Button>
                    
                    {period === 'CUSTOM' && dateRange.startDate && dateRange.endDate && (
                        <Chip
                            label={`${dateRange.startDate} to ${dateRange.endDate}`}
                            onDelete={() => {
                                setDateRange({ startDate: '', endDate: '' });
                                setPeriod('MONTH');
                                loadDashboardData();
                            }}
                            sx={{ mb: 2 }}
                        />
                    )}
                </Box>
            </Box>

            {/* Custom Date Range Dialog */}
            <Dialog open={customDateOpen} onClose={() => setCustomDateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Custom Date Range
                    <IconButton onClick={() => setCustomDateOpen(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCustomDateOpen(false)}>Cancel</Button>
                    <Button onClick={handleApplyCustomRange} variant="contained">
                        Apply Range
                    </Button>
                </DialogActions>
            </Dialog>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Key Metrics Cards */}
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <EuroSymbol sx={{ fontSize: '2rem', mr: 1 }} />
                                    <Typography variant="h6">Total Revenue</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {RevenueAnalyticsService.formatCurrency(summary?.totalRevenue || 0)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    {(summary?.revenueGrowthPercentage || 0) >= 0 ? 
                                        <TrendingUp sx={{ color: 'lightgreen' }} /> : 
                                        <TrendingDown sx={{ color: 'lightcoral' }} />
                                    }
                                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        {RevenueAnalyticsService.formatPercentage(summary?.revenueGrowthPercentage || 0)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Payment sx={{ fontSize: '2rem', mr: 1 }} />
                                    <Typography variant="h6">Transactions</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {(overview?.totalTransactions || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                    Success Rate: {RevenueAnalyticsService.formatPercentage(overview?.successRate || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Group sx={{ fontSize: '2rem', mr: 1 }} />
                                    <Typography variant="h6">Unique Donors</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {(summary?.uniqueDonors || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                    Avg: {RevenueAnalyticsService.formatCurrency(summary?.averageTransactionAmount || 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Speed sx={{ fontSize: '2rem', mr: 1 }} />
                                    <Typography variant="h6">Real-time</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {RevenueAnalyticsService.formatCurrency(realtimeData?.todayRevenue || 0)}
                                </Typography>
                                <Typography variant="body2">
                                    Today's Revenue
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Revenue Trends Chart */}
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Timeline sx={{ mr: 1 }} />
                                    Revenue Trends
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Line 
                                        data={createTrendChartData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'top' },
                                                title: { display: false }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        callback: (value) => 
                                                            RevenueAnalyticsService.formatCurrency(value)
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Revenue Breakdown */}
                    <Grid item xs={12} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Revenue Breakdown
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Doughnut 
                                        data={createBreakdownChartData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom' }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Top Donors Table */}
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccountCircle sx={{ mr: 1 }} />
                                    Top Donors
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Rank</TableCell>
                                                <TableCell>User</TableCell>
                                                <TableCell>Total Donated</TableCell>
                                                <TableCell>Transactions</TableCell>
                                                <TableCell>Last Payment</TableCell>
                                                <TableCell>Role</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {topDonors.map((donor, index) => (
                                                <TableRow key={donor.username || index}>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`#${index + 1}`}
                                                            color={index === 0 ? 'primary' : 'default'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                                                                {donor.username?.[0]?.toUpperCase() || '?'}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {donor.username || 'Anonymous'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {RevenueAnalyticsService.formatCurrency(donor.totalContributed || 0)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {donor.transactionCount || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {donor.lastPaymentDate ? 
                                                                new Date(donor.lastPaymentDate).toLocaleDateString() : 
                                                                'N/A'
                                                            }
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={donor.userRole || 'USER'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Failed Payments Analysis */}
                    <Grid item xs={12} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Warning sx={{ mr: 1, color: theme.palette.warning.main }} />
                                    Failed Payments
                                </Typography>
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Failed
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {failedPayments?.totalFailed || 0}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Potential Lost Revenue
                                    </Typography>
                                    <Typography variant="h6" color="error.main">
                                        {RevenueAnalyticsService.formatCurrency(failedPayments?.potentialLostRevenue || 0)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Failure Rate
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={failedPayments?.failureRate || 0}
                                        color="error"
                                        sx={{ mt: 1 }}
                                    />
                                    <Typography variant="caption">
                                        {RevenueAnalyticsService.formatPercentage(failedPayments?.failureRate || 0)}
                                    </Typography>
                                </Box>

                                {failedPayments?.recommendations && (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Recommendations:
                                        </Typography>
                                        {failedPayments.recommendations.map((rec, index) => (
                                            <Typography key={index} variant="caption" display="block">
                                                • {rec}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Additional Metrics */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Additional Metrics
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Median Transaction
                                            </Typography>
                                            <Typography variant="h6">
                                                {RevenueAnalyticsService.formatCurrency(overview?.medianTransactionAmount || 0)}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Largest Donation
                                            </Typography>
                                            <Typography variant="h6">
                                                {RevenueAnalyticsService.formatCurrency(summary?.largestDonation || 0)}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Status
                                            </Typography>
                                            <Chip 
                                                label={summary?.status || 'UNKNOWN'}
                                                color={
                                                    summary?.status === 'HEALTHY' ? 'success' :
                                                    summary?.status === 'GROWING' ? 'primary' : 'warning'
                                                }
                                            />
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Trend
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {summary?.trend === 'UP' ? 
                                                    <TrendingUp color="success" /> :
                                                    summary?.trend === 'DOWN' ?
                                                    <TrendingDown color="error" /> :
                                                    <Typography>STABLE</Typography>
                                                }
                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                    {summary?.trend || 'STABLE'}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default AdminRevenueDashboard; 
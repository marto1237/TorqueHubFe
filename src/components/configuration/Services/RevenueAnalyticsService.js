import api from '../api';

/**
 * Revenue Analytics Service for Admin Dashboard
 * Handles all revenue tracking, analytics, and user payment data
 */
class RevenueAnalyticsService {
    
    // ===== ADMIN REVENUE ANALYTICS =====
    
    /**
     * Get comprehensive revenue overview with filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise} Revenue analytics response
     */
    async getRevenueOverview(filters = {}) {
        try {
            console.log('🔍 Fetching revenue overview with filters:', filters);
            
            const params = new URLSearchParams();
            
            // Add filters to params if provided
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentType) params.append('paymentType', filters.paymentType);
            if (filters.currency) params.append('currency', filters.currency);
            if (filters.minAmount) params.append('minAmount', filters.minAmount);
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
            
            const response = await api.get(`/analytics/revenue/overview?${params.toString()}`);
            
            console.log('✅ Revenue overview fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch revenue overview:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch revenue analytics',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get revenue summary with key metrics
     * @param {string} period - Time period (TODAY, WEEK, MONTH, QUARTER, YEAR, ALL_TIME)
     * @returns {Promise} Revenue summary response
     */
    async getRevenueSummary(period = 'MONTH') {
        try {
            console.log(`📊 Fetching revenue summary for period: ${period}`);
            
            const response = await api.get(`/analytics/revenue/summary?period=${period}`);
            
            console.log('✅ Revenue summary fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch revenue summary:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch revenue summary',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get payment trends over time
     * @param {Object} params - Trend parameters
     * @returns {Promise} Payment trends response
     */
    async getPaymentTrends(params = {}) {
        try {
            console.log('📈 Fetching payment trends with params:', params);
            
            const searchParams = new URLSearchParams();
            if (params.startDate) searchParams.append('startDate', params.startDate);
            if (params.endDate) searchParams.append('endDate', params.endDate);
            if (params.groupBy) searchParams.append('groupBy', params.groupBy);
            if (params.paymentType) searchParams.append('paymentType', params.paymentType);
            
            const response = await api.get(`/analytics/revenue/trends?${searchParams.toString()}`);
            
            console.log('✅ Payment trends fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch payment trends:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch payment trends',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get top donors/payers
     * @param {Object} params - Top donors parameters
     * @returns {Promise} Top donors response
     */
    async getTopDonors(params = {}) {
        try {
            console.log('🏆 Fetching top donors with params:', params);
            
            const searchParams = new URLSearchParams();
            if (params.limit) searchParams.append('limit', params.limit);
            if (params.period) searchParams.append('period', params.period);
            if (params.sortBy) searchParams.append('sortBy', params.sortBy);
            
            const response = await api.get(`/analytics/revenue/top-donors?${searchParams.toString()}`);
            
            console.log('✅ Top donors fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch top donors:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch top donors',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get revenue breakdown by categories
     * @param {Object} params - Breakdown parameters
     * @returns {Promise} Revenue breakdown response
     */
    async getRevenueBreakdown(params = {}) {
        try {
            console.log('📋 Fetching revenue breakdown with params:', params);
            
            const searchParams = new URLSearchParams();
            if (params.breakdownType) searchParams.append('breakdownType', params.breakdownType);
            if (params.startDate) searchParams.append('startDate', params.startDate);
            if (params.endDate) searchParams.append('endDate', params.endDate);
            
            const response = await api.get(`/analytics/revenue/breakdown?${searchParams.toString()}`);
            
            console.log('✅ Revenue breakdown fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch revenue breakdown:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch revenue breakdown',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get failed payments analysis
     * @param {Object} params - Analysis parameters
     * @returns {Promise} Failed payments analysis response
     */
    async getFailedPaymentsAnalysis(params = {}) {
        try {
            console.log('⚠️ Fetching failed payments analysis');
            
            const searchParams = new URLSearchParams();
            if (params.startDate) searchParams.append('startDate', params.startDate);
            if (params.endDate) searchParams.append('endDate', params.endDate);
            
            const response = await api.get(`/analytics/revenue/failed-payments?${searchParams.toString()}`);
            
            console.log('✅ Failed payments analysis fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch failed payments analysis:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch failed payments analysis',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get real-time revenue metrics
     * @returns {Promise} Real-time revenue response
     */
    async getRealtimeRevenue() {
        try {
            console.log('⚡ Fetching real-time revenue metrics');
            
            const response = await api.get('/analytics/revenue/realtime');
            
            console.log('✅ Real-time revenue metrics fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch real-time revenue:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch real-time revenue',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Export revenue data
     * @param {Object} params - Export parameters
     * @returns {Promise} Export data response
     */
    async exportRevenueData(params = {}) {
        try {
            console.log('💾 Exporting revenue data with params:', params);
            
            const searchParams = new URLSearchParams();
            if (params.format) searchParams.append('format', params.format);
            if (params.startDate) searchParams.append('startDate', params.startDate);
            if (params.endDate) searchParams.append('endDate', params.endDate);
            if (params.includeDetails !== undefined) searchParams.append('includeDetails', params.includeDetails);
            
            const response = await api.get(`/analytics/revenue/export?${searchParams.toString()}`);
            
            console.log('✅ Revenue data exported successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to export revenue data:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to export revenue data',
                error: error.response?.data || error.message
            };
        }
    }
    
    // ===== USER PROFILE ANALYTICS =====
    
    /**
     * Get current user's payment statistics
     * @returns {Promise} User payment stats response
     */
    async getMyPaymentStats() {
        try {
            console.log('👤 Fetching current user payment statistics');
            
            const response = await api.get('/analytics/user-profile/my-stats');
            
            console.log('✅ User payment stats fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch user payment stats:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch payment statistics',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get specific user's payment statistics (admin only)
     * @param {number} userId - User ID
     * @returns {Promise} User payment stats response
     */
    async getUserPaymentStats(userId) {
        try {
            console.log(`👤 Fetching payment stats for user ${userId}`);
            
            const response = await api.get(`/analytics/user-profile/user/${userId}/stats`);
            
            console.log('✅ User payment stats fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch user payment stats:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user payment statistics',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get current user's donation history
     * @param {Object} params - Pagination and sorting parameters
     * @returns {Promise} Donation history response
     */
    async getMyDonationHistory(params = {}) {
        try {
            console.log('💰 Fetching current user donation history');
            
            const searchParams = new URLSearchParams();
            if (params.page !== undefined) searchParams.append('page', params.page);
            if (params.size) searchParams.append('size', params.size);
            if (params.sortBy) searchParams.append('sortBy', params.sortBy);
            if (params.sortDirection) searchParams.append('sortDirection', params.sortDirection);
            
            const response = await api.get(`/analytics/user-profile/my-donations?${searchParams.toString()}`);
            
            console.log('✅ User donation history fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch donation history:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch donation history',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get current user's points breakdown
     * @returns {Promise} Points breakdown response
     */
    async getMyPointsBreakdown() {
        try {
            console.log('🏆 Fetching current user points breakdown');
            
            const response = await api.get('/analytics/user-profile/my-points');
            
            console.log('✅ User points breakdown fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch points breakdown:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch points breakdown',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get current user's contribution impact
     * @returns {Promise} Contribution impact response
     */
    async getMyContributionImpact() {
        try {
            console.log('🌟 Fetching current user contribution impact');
            
            const response = await api.get('/analytics/user-profile/my-impact');
            
            console.log('✅ User contribution impact fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch contribution impact:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch contribution impact',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get current user's donor rank
     * @returns {Promise} Donor rank response
     */
    async getMyDonorRank() {
        try {
            console.log('🥇 Fetching current user donor rank');
            
            const response = await api.get('/analytics/user-profile/my-rank');
            
            console.log('✅ User donor rank fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch donor rank:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch donor rank',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get current user's VIP status
     * @returns {Promise} VIP status response
     */
    async getMyVipStatus() {
        try {
            console.log('⭐ Fetching current user VIP status');
            
            const response = await api.get('/analytics/user-profile/my-vip-status');
            
            console.log('✅ User VIP status fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch VIP status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch VIP status',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Get public donor leaderboard
     * @param {Object} params - Leaderboard parameters
     * @returns {Promise} Donor leaderboard response
     */
    async getDonorLeaderboard(params = {}) {
        try {
            console.log('🏆 Fetching public donor leaderboard');
            
            const searchParams = new URLSearchParams();
            if (params.limit) searchParams.append('limit', params.limit);
            if (params.period) searchParams.append('period', params.period);
            
            const response = await api.get(`/analytics/user-profile/donor-leaderboard?${searchParams.toString()}`);
            
            console.log('✅ Donor leaderboard fetched successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch donor leaderboard:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch donor leaderboard',
                error: error.response?.data || error.message
            };
        }
    }
    
    /**
     * Update user payment profile after successful payment
     * @param {string} paymentIntentId - Payment intent ID
     * @returns {Promise} Update result response
     */
    async updatePaymentProfile(paymentIntentId) {
        try {
            console.log(`💳 Updating payment profile for payment intent: ${paymentIntentId}`);
            
            const response = await api.post('/analytics/user-profile/update-payment-profile', null, {
                params: { paymentIntentId }
            });
            
            console.log('✅ Payment profile updated successfully');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to update payment profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update payment profile',
                error: error.response?.data || error.message
            };
        }
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * Format currency amount for display
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    }
    
    /**
     * Format percentage for display
     * @param {number} percentage - Percentage to format
     * @returns {string} Formatted percentage string
     */
    formatPercentage(percentage) {
        return `${(percentage || 0).toFixed(1)}%`;
    }
    
    /**
     * Calculate growth percentage
     * @param {number} current - Current value
     * @param {number} previous - Previous value
     * @returns {number} Growth percentage
     */
    calculateGrowthPercentage(current, previous) {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
}

export default new RevenueAnalyticsService(); 
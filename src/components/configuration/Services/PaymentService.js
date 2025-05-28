/**
 * Payment Service for TorqueHub
 * Handles all payment-related API calls and integrates with Stripe and TorqueHub backend
 * Uses the existing API structure from services/api.js
 */

import api from '../api';

/**
 * Payment types and constants
 */
export const PAYMENT_TYPES = {
    ONE_TIME: 'one_time',
    SUBSCRIPTION: 'subscription', 
    DONATION: 'donation',
    AD_FREE: 'ad_free'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELED: 'canceled',
    REQUIRES_ACTION: 'requires_action'
};

export const SUBSCRIPTION_PLANS = {
    BASIC: 'basic',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise'
};

/**
 * Payment Service Class
 * Provides methods for handling all payment operations
 */
class PaymentService {
    constructor() {
        // Payment API endpoints - Updated to match Spring Boot PaymentController
        this.endpoints = {
            // Health check endpoint (using test endpoint for now)
            health: '/test/health',
            
            // Configuration endpoints
            config: '/test/stripe-config',
            
            // Payment intent endpoints (matching your Spring Boot controller)
            createIntent: '/payments/create-payment-intent',
            confirmPayment: '/payments/confirm-payment',
            
            // Customer management
            createCustomer: '/payments/create-customer',
            attachPaymentMethod: '/payments/attach-payment-method',
            
            // Checkout sessions (for subscriptions)
            createCheckout: '/payments/create-checkout-session',
            
            // Transaction history (from PaymentTransactionController)
            paymentHistory: '/payment-transactions',
            paymentStatus: '/payment-transactions/by-payment-intent',
            
            // Test endpoints for development
            testPaymentIntent: '/test/payment-intent',
            testCustomer: '/test/customer',
            testCheckoutSession: '/test/checkout-session'
        };
    }

    /**
     * Test connection to payment service
     * @returns {Promise<Object>} Service health status
     */
    async testConnection() {
        try {
            console.log('🔌 Testing payment service connection...');
            console.log('Target URL:', `${window.location.origin}/api/test/health`);
            
            // Use the test health endpoint first
            const response = await api.get(this.endpoints.health, { requiresAuth: false });
            
            console.log('✅ Payment service is healthy');
            return {
                success: true,
                message: 'Payment service is operational',
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Payment service connection failed:', error);
            
            // Provide more detailed error information
            let errorMessage = 'Failed to connect to payment service';
            if (error.response) {
                errorMessage = `HTTP ${error.response.status}: ${error.response.data?.message || 'Server error'}`;
            } else if (error.request) {
                errorMessage = 'No response from server - is the Spring Boot API running?';
            } else {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                message: errorMessage,
                error: error,
                details: {
                    url: `${window.location.origin}/api/test/health`,
                    errorType: error.response ? 'server_error' : error.request ? 'network_error' : 'client_error'
                }
            };
        }
    }

    /**
     * Get Stripe configuration from backend
     * @returns {Promise<Object>} Stripe configuration
     */
    async getStripeConfig() {
        try {
            console.log('⚙️ Loading Stripe configuration...');
            const response = await api.get(this.endpoints.config, { requiresAuth: false });
            
            console.log('✅ Stripe configuration loaded');
            return {
                success: true,
                data: response.data
            };
            
        } catch (error) {
            console.error('❌ Failed to load Stripe config:', error);
            return {
                success: false,
                message: error.message || 'Configuration loading failed',
                error: error
            };
        }
    }

    /**
     * Create a payment intent for one-time payments
     * @param {Object} paymentData - Payment details
     * @returns {Promise<Object>} Payment intent response
     */
    async createPaymentIntent(paymentData) {
        try {
            // Validate input data
            if (!paymentData.amount || paymentData.amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Prepare payment request data to match Spring Boot PaymentIntentDTO
            const requestData = {
                amount: Math.round(paymentData.amount * 100), // Convert to cents for Stripe
                currency: paymentData.currency || 'usd',
                description: paymentData.description || 'TorqueHub Payment'
            };

            console.log('💳 Creating payment intent:', requestData);
            const response = await api.post(this.endpoints.createIntent, requestData);
            
            console.log('✅ Payment intent created successfully');
            return {
                success: true,
                data: {
                    paymentIntentId: response.data.paymentIntentId,
                    clientSecret: response.data.clientSecret,
                    amount: response.data.amount,
                    currency: response.data.currency,
                    status: response.data.status
                },
                message: 'Payment intent created successfully'
            };
            
        } catch (error) {
            console.error('❌ Payment intent creation failed:', error);
            
            // Handle specific error cases
            let errorMessage = 'Payment intent creation failed';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    /**
     * Create a Stripe customer
     * @param {Object} customerData - Customer information
     * @returns {Promise<Object>} Customer creation response
     */
    async createCustomer(customerData) {
        try {
            console.log('👤 Creating Stripe customer...');
            
            const response = await api.post(this.endpoints.createCustomer, null, {
                params: {
                    email: customerData.email,
                    name: customerData.name
                }
            });

            console.log('✅ Customer created successfully');
            return {
                success: true,
                data: response.data,
                message: 'Customer created successfully'
            };
            
        } catch (error) {
            console.error('❌ Customer creation failed:', error);
            return {
                success: false,
                message: error.message || 'Customer creation failed',
                error: error
            };
        }
    }

    /**
     * Create a checkout session for subscriptions or complex payments
     * @param {Object} sessionData - Session configuration
     * @returns {Promise<Object>} Checkout session response
     */
    async createCheckoutSession(sessionData) {
        try {
            // Prepare checkout session request to match Spring Boot CheckoutSessionRequest
            const requestData = {
                productName: sessionData.productName || 'TorqueHub Service',
                amount: Math.round(sessionData.amount * 100), // Convert to cents
                successUrl: sessionData.successUrl || `${window.location.origin}/payment-success`,
                cancelUrl: sessionData.cancelUrl || `${window.location.origin}/payment-cancel`
            };

            console.log('🛒 Creating checkout session:', requestData);
            const response = await api.post(this.endpoints.createCheckout, requestData);
            
            console.log('✅ Checkout session created successfully');
            return {
                success: true,
                data: {
                    sessionId: response.data.sessionId,
                    checkoutUrl: response.data.url
                },
                message: 'Checkout session created successfully'
            };
            
        } catch (error) {
            console.error('❌ Checkout session creation failed:', error);
            return {
                success: false,
                message: error.message || 'Checkout session creation failed',
                error: error
            };
        }
    }

    /**
     * Confirm a payment intent
     * @param {string} paymentIntentId - Payment intent ID to confirm
     * @returns {Promise<Object>} Payment confirmation response
     */
    async confirmPayment(paymentIntentId) {
        try {
            console.log('✅ Confirming payment intent:', paymentIntentId);
            
            const response = await api.post(`${this.endpoints.confirmPayment}/${paymentIntentId}`);
            
            console.log('✅ Payment confirmed successfully');
            return {
                success: true,
                data: response.data,
                message: 'Payment confirmed successfully'
            };
            
        } catch (error) {
            console.error('❌ Payment confirmation failed:', error);
            return {
                success: false,
                message: error.message || 'Payment confirmation failed',
                error: error
            };
        }
    }

    /**
     * Process a donation payment
     * @param {Object} donationData - Donation details
     * @returns {Promise<Object>} Donation processing response
     */
    async processDonation(donationData) {
        try {
            console.log('💝 Processing donation:', donationData);
            
            // For donations, we create a payment intent with donation-specific metadata
            const paymentData = {
                amount: donationData.amount,
                currency: 'usd',
                description: `Donation: ${donationData.message || 'Support TorqueHub'}`,
                type: PAYMENT_TYPES.DONATION
            };
            
            // Use the same payment intent creation but mark as donation
            return await this.createPaymentIntent(paymentData);
            
        } catch (error) {
            console.error('❌ Donation processing failed:', error);
            return {
                success: false,
                message: error.message || 'Donation processing failed',
                error: error
            };
        }
    }

    /**
     * Create a subscription
     * @param {Object} subscriptionData - Subscription details
     * @returns {Promise<Object>} Subscription creation response
     */
    async createSubscription(subscriptionData) {
        try {
            console.log('🔄 Creating subscription:', subscriptionData);
            
            // For subscriptions, use checkout session
            const sessionData = {
                productName: `TorqueHub ${subscriptionData.planId} Plan`,
                amount: this.getSubscriptionAmount(subscriptionData.planId),
                successUrl: `${window.location.origin}/subscription-success`,
                cancelUrl: `${window.location.origin}/subscription-cancel`
            };
            
            return await this.createCheckoutSession(sessionData);
            
        } catch (error) {
            console.error('❌ Subscription creation failed:', error);
            return {
                success: false,
                message: error.message || 'Subscription creation failed',
                error: error
            };
        }
    }

    /**
     * Get payment status by payment intent ID
     * @param {string} paymentIntentId - Payment intent ID
     * @returns {Promise<Object>} Payment status response
     */
    async getPaymentStatus(paymentIntentId) {
        try {
            console.log('📊 Getting payment status for:', paymentIntentId);
            
            const response = await api.get(`${this.endpoints.paymentStatus}/${paymentIntentId}`);
            
            console.log('✅ Payment status retrieved');
            return {
                success: true,
                data: response.data,
                message: 'Payment status retrieved successfully'
            };
            
        } catch (error) {
            console.error('❌ Failed to get payment status:', error);
            return {
                success: false,
                message: error.message || 'Failed to get payment status',
                error: error
            };
        }
    }

    /**
     * Get payment history for the current user
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} Payment history response
     */
    async getPaymentHistory(filters = {}) {
        try {
            console.log('📋 Getting payment history...');
            
            const response = await api.get(this.endpoints.paymentHistory, { params: filters });
            
            console.log('✅ Payment history retrieved');
            return {
                success: true,
                data: response.data,
                message: 'Payment history retrieved successfully'
            };
            
        } catch (error) {
            console.error('❌ Failed to get payment history:', error);
            return {
                success: false,
                message: error.message || 'Failed to get payment history',
                error: error
            };
        }
    }

    /**
     * Get subscription amount based on plan
     * @param {string} planId - Subscription plan ID
     * @returns {number} Amount in dollars
     */
    getSubscriptionAmount(planId) {
        const amounts = {
            [SUBSCRIPTION_PLANS.BASIC]: 9.99,
            [SUBSCRIPTION_PLANS.PREMIUM]: 19.99,
            [SUBSCRIPTION_PLANS.ENTERPRISE]: 49.99
        };
        return amounts[planId] || 9.99;
    }

    /**
     * Format currency amount for display
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    }

    /**
     * Validate card number using Luhn algorithm
     * @param {string} cardNumber - Card number to validate
     * @returns {boolean} Whether card number is valid
     */
    validateCardNumber(cardNumber) {
        // Remove spaces and non-digits
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        // Check length
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
            return false;
        }
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    /**
     * Validate expiry date
     * @param {string} expiry - Expiry date in MM/YY format
     * @returns {boolean} Whether expiry date is valid
     */
    validateExpiryDate(expiry) {
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        
        const month = parseInt(match[1]);
        const year = parseInt(match[2]) + 2000;
        
        if (month < 1 || month > 12) return false;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        return year > currentYear || (year === currentYear && month >= currentMonth);
    }

    /**
     * Get card brand from card number
     * @param {string} cardNumber - Card number
     * @returns {string} Card brand
     */
    getCardBrand(cardNumber) {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        if (/^4/.test(cleanNumber)) return 'Visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'American Express';
        if (/^6/.test(cleanNumber)) return 'Discover';
        
        return 'Unknown';
    }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService; 
import api from '../api';

const UserService = {

    getUsers: async () => {
        try {
            const response = await api.get("/users");
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            throw error;
        }
    },


    updateUser: async (id, updateData) => {
        try {
            const response = await api.put(`/users/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating user with ID ${id}:`, error);
            throw error;
        }
    },

    promoteUser: async (id, promotionData) => {
        try {
            const response = await api.put(`/users/${id}/promote`, promotionData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error(`Error promoting user with ID ${id}:`, error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw error;
        }
    },

    getUserActivity: async (id) => {
        try {
            const response = await api.get(`/users/user_activity/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching activity for user with ID ${id}:`, error);
            throw error;
        }
    },

    getUserStats: async (id) => {
        try {
            const response = await api.get(`/users/user_stats/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching stats for user with ID ${id}:`, error);
            throw error;
        }
    },

    getUserActivityScore: async (id) => {
        try {
            const response = await api.get(`/users/user_activity_score/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching activity score for user with ID ${id}:`, error);
            throw error;
        }
    },

};



export default UserService;


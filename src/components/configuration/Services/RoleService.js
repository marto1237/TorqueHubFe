import api from '../api'; 

const RoleService = {
    getRoles: async () => {
        try {
            const response = await api.get(`/roles`, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    },

    getRoleById: async (id) => {
        try {
            const response = await api.get(`/roles/${id}`, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching role with ID ${id}:`, error);
            throw error;
        }
    },

    createRole: async (roleData) => {
        try {
            const response = await api.post('/roles', roleData, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    },

    updateRole: async (id, roleData) => {
        try {
            const response = await api.put(`/roles/${id}`, roleData,{
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating role with ID ${id}:`, error);
            throw error;
        }
    },

    deleteRole: async (id) => {
        try {
            const response = await api.delete(`/roles/${id}`, {
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting role with ID ${id}:`, error);
            throw error;
        }
    },
};

export default RoleService;

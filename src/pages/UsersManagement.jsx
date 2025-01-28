import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Pagination,
    Autocomplete,
} from '@mui/material';
import { Edit, Delete, ArrowUpward } from '@mui/icons-material';
import UserService from '../components/configuration/Services/UserService';
import RoleService from '../components/configuration/Services/RoleService';
import UserFilterPanel from '../components/common/UserFilterPanel';
import FilterService from "../components/configuration/Services/FilterService";
import { useAppNotifications } from '../components/common/NotificationProvider';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPromoteDialog, setOpenPromoteDialog] = useState(false);
    const [newRole, setNewRole] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    const notifications = useAppNotifications();

    // Fetch Roles
    const fetchRoles = async () => {
        try {
            const rolesData = await RoleService.getRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching roles:', error);
            notifications.show('Error fetching roles', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.getUsers();
            setUsers(response.content || []);
            setTotalPages(response.totalPages || 1);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            notifications.show('Error fetching users', {
                autoHideDuration: 3000,
                severity: 'error',
            });
            setIsLoading(false);
        }
    };


     // Fetch Users with Filters Applied
     const fetchFilteredUsers = async (filterParams) => {
        setIsFiltering(true);
        try {
            const response = await FilterService.filterUsers(
                filterParams.username,
                filterParams.email,
                filterParams.role,
                page
            );
            setUsers(response.content || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Error filtering users:", error);
            notifications.show("Error filtering users", {
                autoHideDuration: 3000,
                severity: "error",
            });
        }
    };

    useEffect(() => {
        if (isFiltering) {
            fetchFilteredUsers(filters);
        } else {
            fetchUsers();
            fetchRoles();
        }
    }, [page, isFiltering]);

    const handleApplyFilters = (filterParams) => {
        setFilters(filterParams);
        fetchFilteredUsers(filterParams);
    };

    const handleClearFilters = () => {
        setFilters(null);
        setIsFiltering(false);
        fetchUsers();
    };


    // Open Edit Dialog
    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOpenEditDialog(true);
    };

    // Close Edit Dialog
    const handleCloseEditDialog = () => {
        setSelectedUser(null);
        setOpenEditDialog(false);
    };

    // Save User Changes
    const handleEditSave = async () => {
        try {
            if (selectedUser) {
                await UserService.updateUser(selectedUser.id, {
                    username: selectedUser.username,
                    email: selectedUser.email,
                    role: selectedUser.role,
                });
                notifications.show('User updated successfully!', {
                    autoHideDuration: 3000,
                    severity: 'success',
                });
                fetchUsers();
                handleCloseEditDialog();
            }
        } catch (error) {
            console.error('Error updating user:', error);
            notifications.show('Error updating user', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    // Open Promote/Demote Dialog
    const handlePromoteClick = (user) => {
        setSelectedUser(user);
        setOpenPromoteDialog(true);
    };

    // Close Promote/Demote Dialog
    const handleClosePromoteDialog = () => {
        setSelectedUser(null);
        setNewRole(null);
        setOpenPromoteDialog(false);
    };

    // Promote or Demote User
    const handlePromoteSave = async () => {
        try {
            if (selectedUser && newRole) {
                await UserService.promoteUser(selectedUser.id, {
                    promotedUserId: selectedUser.id,
                    promoterUserId: 1, // Replace with actual promoter ID (admin ID)
                    newRole: newRole.name,
                });
                notifications.show('User role updated successfully!', {
                    autoHideDuration: 3000,
                    severity: 'success',
                });
                fetchUsers();
                handleClosePromoteDialog();
            } else {
                notifications.show('Please select a role.', {
                    autoHideDuration: 3000,
                    severity: 'warning',
                });
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            notifications.show('Error updating user role', {
                autoHideDuration: 3000,
                severity: 'error',
            });
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value - 1);
    };

    const handleInputChange = (field, value) => {
        setSelectedUser((prevUser) => ({
            ...prevUser,
            [field]: value,
        }));
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
            <Typography variant="h4" color="textSecondary" sx={{ marginBottom: '20px', fontWeight: 'bold'}}>
                User Management
            </Typography>

            <UserFilterPanel onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />


            <Grid container spacing={3}>
                {users.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {user.username}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Email: {user.email}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Role: {user.role}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" variant="outlined" onClick={() => handleEditClick(user)}>
                                    <Edit />
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handlePromoteClick(user)}
                                >
                                    <ArrowUpward />
                                    Promote/Demote
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => UserService.deleteUser(user.id)}
                                >
                                    <Delete />
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination count={totalPages} page={page + 1} onChange={handlePageChange} color="primary" />
            </Box>

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Username"
                                variant="filled"
                                value={selectedUser.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                variant="filled"
                                value={selectedUser.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                            <Autocomplete
                                options={roles}
                                getOptionLabel={(option) => option.name || ''}
                                value={roles.find((role) => role.name === selectedUser.role) || null}
                                onChange={(event, newValue) =>
                                    handleInputChange('role', newValue ? newValue.name : selectedUser.role)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Role" variant="filled" />
                                )}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditSave} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Promote/Demote User Dialog */}
            <Dialog open={openPromoteDialog} onClose={handleClosePromoteDialog} fullWidth maxWidth="sm">
                <DialogTitle>Promote/Demote User</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Current Role: {selectedUser.role}
                            </Typography>
                            <Autocomplete
                                options={roles}
                                getOptionLabel={(option) => option.name || ''}
                                value={newRole || null}
                                onChange={(event, newValue) => setNewRole(newValue)}
                                renderInput={(params) => <TextField {...params} label="Select New Role" variant="filled" />}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePromoteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handlePromoteSave} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;

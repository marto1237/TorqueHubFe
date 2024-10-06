import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const  fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchUsers();

    }, []);

    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.length > 0 ? (
                    users.map((user) => (
                        <li key={user.id}>{user.username} - {user.email} -{user.role}</li>
                    ))
                ) : (
                    <li>No users found</li>
                )}
            </ul>
        </div>
    );
};

export default App;

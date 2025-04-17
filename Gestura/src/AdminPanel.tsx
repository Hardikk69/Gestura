import api from './api/api';
import { IonPage } from '@ionic/react';
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/register');
                setUsers(response.data.users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (username: string) => {
        try {
            await api.delete(`/delete/${username}`);
            setUsers(users.filter(user => user.name !== username));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            console.log("Fetched Users:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("admin");
        sessionStorage.removeItem("admin");

        navigate("/login");
    };


    return (
        <IonPage>
            <div style={{ padding: "20px" }}>
                <h3>Admin Panel</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                            <th style={{ padding: '8px' }}>Username</th>
                            <th style={{ padding: '8px' }}>Email</th>
                            <th style={{ padding: '8px' }}>Password</th>
                            <th style={{ padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td style={{ padding: '8px' }}>{user.name}</td>
                                <td style={{ padding: '8px' }}>{user.email}</td>
                                <td style={{ padding: '8px' }}>{user.password}</td>
                                <td style={{ padding: '8px' }}>
                                <button onClick={() => handleDelete(user.name)}
                                        style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <button onClick={handleLogout}
                    style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "8px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        float: "right",
                        margin: "10px"
                    }}>Logout</button>
            </div>
        </IonPage>
    );
};

export default AdminPanel;

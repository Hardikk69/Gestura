import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import './Login.css';
import api from './api/api';

const ADMIN_EMAIL = "admin123";
const ADMIN_PASSWORD = "admin123";

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log("Login button clicked!");

        if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            window.location.href = '/admin-panel';
            return;
        }

        try {
            const response = await api.post('/login', { name: username, password });

            console.log('Login Response:', response.data);

            if (response.data.message === "✅ User logged in successfully") {
                window.location.href = '/main-window';
                alert(response.data.message)
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert("Wrong Username or password.");
        }
    };

    return (
        <IonPage>
            <div className="login-container">
                <div className="login-box">
                    <h3 className="login-title">Login</h3>

                    <label className="input-label">Username</label>
                    <InputField
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />

                    <label className="input-label" style={{ marginTop: '30px' }}>Password</label>
                    <InputField
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />

                    <CustomButton text="Sign in" onClick={handleLogin} className="custom-button" />

                    <p className="signup-text">
                        Don't have an account? <a href="/register" className="signup-link">Sign Up</a>
                    </p>
                </div>
            </div>
        </IonPage>
    );
};

export default Login;

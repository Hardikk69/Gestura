import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import './Login.css';
import api from './api/api';
const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log("Login button clicked!");  // Debugging log
        try {
            const response = await api.post('/login', { name: username, password });
            console.log('Login Response:', response.data);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };
    

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="login-container">
                    <div className="login-box">
                        <h2 className="login-title">Login</h2>

                        <label className="input-label">Username</label>
                        <InputField
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                        />

                        <label className="input-label">Password</label>
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
            </IonContent>
        </IonPage>
    );
};

export default Login;

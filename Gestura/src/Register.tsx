import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import './Register.css';
import api from './api/api';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleSignup = async () => {
        console.log("Register button clicked!");  // Debugging log
        try {
            const response = await api.post('/register', {
                name: username,
                email: email,
                password: password,
                confirm_password: confirmPassword
            });
        console.log('Register Response:', response.data);
        } catch (error) {
            console.error('Error registering in:', error);
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="signup-container">
                    <h2>Sign Up</h2>
                    <InputField
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="input-field"
                    />
                    <InputField
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                        className="input-field"
                    />
                    <InputField
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="input-field"
                    />
                    <InputField
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="input-field"
                    />
                    <CustomButton text="Sign Up" onClick={handleSignup} />
                    <p>Already have an account? <a href="/login">Sign in</a></p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;

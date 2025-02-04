import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter } from '@ionic/react';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import './Register.css';
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
    const handleSignup = () => {
        console.log('Signing up with:', { username, email, password, confirmPassword });
    };
    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="signup-container">
                    <h2>Sign Up</h2>
                    <InputField type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
                    <InputField type="email" placeholder="Email" value={email} onChange={handleEmailChange} />
                    <InputField type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
                    <InputField type="password" placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                    <CustomButton text="Sign Up" onClick={handleSignup} />
                <p>Already have an account? <a href="/login">Sign in</a></p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;
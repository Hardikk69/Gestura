import React, { useEffect, useState } from 'react';
import { IonPage } from '@ionic/react';
import InputField from './components/InputField';
import CustomButton from './components/CustomButton';
import './Register.css';
import api from './api/api';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [allUsernames, setAllUsernames] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                const response = await api.get('/register');
                const usernames = response.data.users.map((user: any) => user.name);
                setAllUsernames(usernames);
            } catch (error) {
                console.error("❌ Failed to fetch users", error);
            }
        };
        fetchUsernames();
    }, []);

    const isValidEmail = (email: string): boolean => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    };

    const handleSignup = async () => {
        let hasError = false;
    
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
    
        if (allUsernames.includes(username)) {
            setUsernameError('❌ Username already taken.');
            hasError = true;
        }
    
        if (!isValidEmail(email)) {
            setEmailError('❌ Please enter a valid email address.');
            hasError = true;
        }
    
        if (password !== confirmPassword && password.length != 8) {
            setPasswordError('❌ Passwords do not match.');
            hasError = true;
        }
    
        if (hasError) return;
    
        try {
            console.log('Sending data to backend...');
            const response = await api.post('/register', {
                name: username,
                email: email,
                password: password,
                confirm_password: confirmPassword
            });
    
            console.log('Response received:', response.data);
    
            if (response.data.message) {
                alert('✅ Registration successful! Redirecting to login...');
    
                window.location.href = '/login';
            } else {
                alert('❌ Something went wrong!');
            }
    
        } catch (error: any) {
            console.error('Error during registration:', error);
            alert(error.response?.data?.detail || '❌ Registration failed.');
        }
    };

    return (
        <IonPage>
            <div className="signup-container">
                <h3>Sign Up</h3>

                <div className="input-wrapper">
                    <label className="input-label">Username</label>
                    <InputField
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={usernameError ? 'input-error' : 'input-field'}
                    />
                    {usernameError && <span className="error-text">{usernameError}</span>}
                </div>

                <div className="input-wrapper">
                    <label className="input-label">Email</label>
                    <InputField
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={emailError ? 'input-error' : 'input-field'}
                    />
                    {emailError && <span className="error-text">{emailError}</span>}
                </div>

                <div className="input-wrapper">
                    <label className="input-label">Password</label>
                    <InputField
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={passwordError ? 'input-error' : 'input-field'}
                    />
                </div>

                <div className="input-wrapper">
                    <label className="input-label">Confirm Password</label>
                    <InputField
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={passwordError ? 'input-error' : 'input-field'}
                    />
                    {passwordError && <span className="error-text">{passwordError}</span>}
                </div>

                <CustomButton text="Sign Up" onClick={handleSignup} />
                <p>Already have an account? <a href="/login">Sign in</a></p>
            </div>
        </IonPage>
    );
};

export default Register;

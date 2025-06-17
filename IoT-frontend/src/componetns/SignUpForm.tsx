import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import IotLogo from '../assets/iot-logo.png';

interface Account {
    username: string;
    email: string;
    password: string;
}

interface Errors {
    username?: string;
    email?: string;
    password?: string;
}

const SignUpForm: React.FC = () => {
    const [account, setAccount] = useState<Account>({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Errors>({});

    const navigate = useNavigate();

    const handleChangeRoute = () => {
        navigate('/home');
    };

    const validate = (): Errors | null => {
        const validationErrors: Errors = {};

        if (account.username.trim() === '') {
            validationErrors.username = 'Username is required!';
        }
        if (account.email.trim() === '') {
            validationErrors.email = 'Email is required!';
        }
        if (account.password.trim() === '') {
            validationErrors.password = 'Password is required!';
        }

        return Object.keys(validationErrors).length === 0 ? null : validationErrors;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors || {});
        if (validationErrors) return;

        axios
            .post('http://localhost:3100/api/user/create', {
                name: account.username,
                email: account.email,
                password: account.password
            })
            .then((response) => {
                const token = response.data.token;
                if (token) {
                    localStorage.setItem('token', token);
                }

                fetch("http://localhost:3100/api/posts", {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-auth-token': token ?? ''
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("Posts:", data);
                        handleChangeRoute();
                    })
                    .catch(err => {
                        console.error("Błąd pobierania postów:", err);
                        handleChangeRoute();
                    });
            })
            .catch((error) => {
                const errorMessages: Errors = {};
                errorMessages.password =
                    "Given username doesn't exist or the password is wrong!";
                setErrors(errorMessages || {});
                console.log(error);
            });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAccount((prevAccount) => ({
            ...prevAccount,
            [name]: value
        }));
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            pb: 8
        }}>
            <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translateY(-40px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <img src={IotLogo} alt="Logo" style={{ width: '150px', height: '150px' }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    <Box component="span" sx={{ color: 'white',fontWeight: 'bold' }}>
                        IoT-
                    </Box>
                    <Box component="span" sx={{ color: '#006081',fontWeight: 'bold' }}>
                        Dashboard
                    </Box>
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom>
                    <Box component="span" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Create an account
                    </Box>
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box mb={1}>
                        <TextField
                            placeholder="Username"
                            value={account.username}
                            name="username"
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            variant="outlined"

                            sx={{
                                backgroundColor: '#006081', 
                                color: 'white',
                                borderRadius: 15,
                                width: '60%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                    '&::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        opacity: 1,
                                    },
                                },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#004d66',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                },
                            }}
                            InputLabelProps={{ shrink: false }}
                            InputProps={{ notched: false }}
                        />
                    </Box>
                    <Box mb={1}>
                        <TextField
                            placeholder="Email"
                            value={account.email}
                            name="email"
                            onChange={handleChange}
                            type="email"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            sx={{
                                backgroundColor: '#006081', 
                                color: 'white',
                                borderRadius: 15,
                                width: '60%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                    '&::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        opacity: 1,
                                    },
                                },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#004d66',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                },
                            }}
                            InputLabelProps={{ shrink: false }}
                            InputProps={{ notched: false }}
                        />
                    </Box>
                    <Box mb={1}>
                        <TextField
                            placeholder="Password"
                            value={account.password}
                            name="password"
                            onChange={handleChange}
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            sx={{
                                backgroundColor: '#006081', 
                                color: 'white',
                                borderRadius: 15,
                                width: '60%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'white',
                                    '&::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        opacity: 1,
                                    },
                                },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: '#004d66',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                },
                            }}
                            InputLabelProps={{ shrink: false }}
                            InputProps={{ notched: false }}
                        />
                    </Box>
                    <Button 
                        type="submit" 
                        variant="contained"
                        sx={{
                            mt: 2,
                            width: '20%',
                            color: 'white',
                            backgroundColor: '#006081',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#004d66',
                            }
                        }}
                    >
                        Sign Up
                    </Button>
                    
                    <Box sx={{ mt: 0.5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ color: 'white', mb: 1 }}>
                            Already have an account?
                        </Typography>
                        <Button
                            component={Link}
                            to="/"
                            variant="contained"
                            sx={{
                                mt: 1,
                                width: '15%',
                                color: 'white',
                                backgroundColor: '#006081',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#004d66',
                                }
                            }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </form>
            </Container>


            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 9999
            }}>
                {Object.values(errors).map((error, index) => (
                    error && (
                        <Alert key={index} severity="error" sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                            {error}
                        </Alert>
                    )
                ))}
            </Box>
        </Box>
    );
};

export default SignUpForm;

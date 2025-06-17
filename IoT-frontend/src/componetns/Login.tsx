import {Component, type ChangeEvent, type FormEvent} from "react";
import {TextField, Button, Container, Typography, Alert} from '@mui/material';
import Box from "@mui/material/Box";
import IotLogo from '../assets/iot-logo.png';
import {Link} from 'react-router-dom';


interface Account {
    username: string;
    password: string;
}

interface Errors {
    username?: string;
    password?: string;
    submit?: string;
}

interface State {
    account: Account;
    errors: Errors;
}

class LoginForm extends Component<{}, State> {
    state: State = {
        account: {
            username: "",
            password: ""
        },
        errors: {}
    };

    validate = (): Errors | null => {
        const errors: Errors = {};

        const {account} = this.state;
        if (account.username.trim() === '') {
            errors.username = 'Username is required!';
        }
        if (account.password.trim() === '') {
            errors.password = 'Password is required!';
        }

        return Object.keys(errors).length === 0 ? null : errors;
    };

    handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = this.validate();
        this.setState({errors: errors || {}});
        if (errors) return;

        try {
            const response = await fetch('http://localhost:3100/api/user/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: this.state.account.username,
                    password: this.state.account.password
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();


            localStorage.setItem('token', data.token);


            window.location.href = '/dashboard';

        } catch (error: unknown) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                this.setState({
                    errors: {
                        ...this.state.errors,
                        submit: error.message || 'Login failed. Please try again.'
                    }
                });
                setTimeout(() => {
                    this.setState(prevState => ({
                        errors: {
                            ...prevState.errors,
                            submit: undefined
                        }
                    }));
                }, 2000);
            }
            this.setState({
                errors: {
                    ...this.state.errors,
                    submit: 'Login failed. Please try again.'
                }
            });

        }
    };

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const account = {...this.state.account};
        const name = event.currentTarget.name as keyof Account;
        account[name] = event.currentTarget.value;
        this.setState({account});
    };

    render() {
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
                <Container maxWidth="sm"
                           sx={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Box sx={{display: 'flex', justifyContent: 'center', mb: 4}}>
                        <img src={IotLogo} alt="Logo" style={{width: '150px', height: '150px'}}/>
                    </Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        <Box component="span" sx={{color: 'white', fontWeight: 'bold'}}>
                            IoT-
                        </Box>
                        <Box component="span" sx={{color: '#006081', fontWeight: 'bold'}}>
                            Dashboard
                        </Box>
                    </Typography>
                    <Typography variant="h6" component="h2" gutterBottom>
                        <Box component="span" sx={{color: 'white', fontWeight: 'bold'}}>
                            Welcome
                        </Box>
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <TextField
                                sx={{
                                    backgroundColor: '#006081',
                                    color: 'white',
                                    borderRadius: 15,
                                    width: '60%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#004d66',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            opacity: 1,
                                        },
                                    },
                                }}
                                placeholder="Username"
                                InputLabelProps={{shrink: false}}
                                InputProps={{
                                    notched: false,
                                }}
                                value={this.state.account.username}
                                name="username"
                                onChange={this.handleChange}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                        </div>
                        <div className="form-group">
                            <TextField
                                sx={{
                                    backgroundColor: '#006081',
                                    color: 'white',
                                    borderRadius: 15,
                                    width: '60%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#004d66',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover fieldset': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                            border: 'none',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        '&::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            opacity: 1,
                                        },
                                    },
                                }}
                                placeholder="Password"
                                InputLabelProps={{shrink: false}}
                                InputProps={{
                                    notched: false,
                                }}
                                value={this.state.account.password}
                                name="password"
                                onChange={this.handleChange}
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                mt: 2,
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
                            Login
                        </Button>

                        <Box sx={{mt: 2, textAlign: 'center'}}>
                            <Typography variant="body2" color="text.secondary" sx={{color: 'white', mb: 1}}>
                                or
                            </Typography>
                            <Button
                                component={Link}
                                to="/signup"
                                variant="contained"
                                sx={{
                                    mt: 1,
                                    width: '30%',
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
                                Create an account
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
                    {this.state.errors.username && (
                        <Alert severity="error" sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                            {this.state.errors.username}
                        </Alert>
                    )}
                    {this.state.errors.password && (
                        <Alert severity="error" sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                            {this.state.errors.password}
                        </Alert>
                    )}
                    {this.state.errors.submit && (
                        <Alert severity="error" sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                            {this.state.errors.submit}
                        </Alert>
                    )}
                </Box>
            </Box>
        );
    }
}

export default LoginForm;
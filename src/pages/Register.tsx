import { useState } from 'react';
import {
    Typography,
    Container,
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Link,
    InputAdornment,
    IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuthStore } from '../store';
import { useNavigate, Link as RouterLink } from 'react-router';
import { authAPI } from '../utils/api';

export const Register = () => {
    const { setToken, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.register({ nom, email, password });
            setToken(data.token);
            setUser(data.user);
            navigate('/onboarding');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                'Une erreur est survenue lors de l\'inscription.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Container maxWidth="xs">
                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 2,
                        backdropFilter: 'blur(12px)',
                        bgcolor: 'rgba(255, 248, 245, 0.85)',
                    }}
                >
                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box textAlign="center">
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="FORCE Logo"
                                sx={{ height: 80, mb: 1 }}
                            />
                            <Typography variant="h1" color="primary" fontWeight="bold">FORCE</Typography>
                            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>Créer votre compte</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Rejoignez la communauté FORCE aujourd'hui.
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Nom Complet"
                                variant="outlined"
                                fullWidth
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                                autoFocus
                            />
                            <TextField
                                label="Email"
                                variant="outlined"
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <TextField
                                label="Mot de passe (8 caractères min.)"
                                variant="outlined"
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                slotProps={{
                                    input: {
                                        sx: { mb: 0 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                    htmlInput: {
                                        minLength: 8,
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 1, height: 56, fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire'}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Typography variant="body2">
                                    Déjà un compte ?{' '}
                                    <Link component={RouterLink} to="/login" sx={{ fontWeight: 'bold' }}>
                                        Se connecter
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

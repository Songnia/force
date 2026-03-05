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
    Link
} from '@mui/material';
import { useAuthStore } from '../store';
import { useNavigate, Link as RouterLink } from 'react-router';
import { authAPI } from '../utils/api';

export const Login = () => {
    const { setToken, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.login(email, password);
            setToken(data.token);
            setUser(data.user);
            navigate('/');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                'Identifiants incorrects.'
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
                                sx={{ height: 80, mb: 2 }}
                            />
                            <Typography variant="h1" color="primary" fontWeight="bold">FORCE</Typography>
                            <Typography variant="body2" color="text.secondary">
                                La force de gérer, la liberté de grandir.
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                label="Mot de passe"
                                variant="outlined"
                                fullWidth
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 1, height: 56, fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Typography variant="body2">
                                    Nouveau sur FORCE ?{' '}
                                    <Link component={RouterLink} to="/register" sx={{ fontWeight: 'bold' }}>
                                        Créer un compte
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

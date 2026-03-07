import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    useMediaQuery,
    useTheme,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Alert,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { useAuthStore } from '../store';
import { getPendingSyncItems, markSynced } from '../utils/db';
import { ventesAPI } from '../utils/api';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const AppLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const role = useAuthStore((s) => s.role);

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
        open: false, msg: '', severity: 'success',
    });

    const syncQueue = useCallback(async () => {
        const pending = await getPendingSyncItems();
        if (pending.length === 0) return;

        setSyncing(true);
        let successCount = 0;
        let errorCount = 0;

        for (const item of pending) {
            try {
                if (item.type === 'vente') {
                    await ventesAPI.create(item.payload);
                    await markSynced(item.id!);
                    successCount++;
                }
            } catch {
                errorCount++;
            }
        }

        setSyncing(false);
        if (successCount > 0) {
            setSnack({ open: true, msg: `✅ ${successCount} vente(s) hors-ligne synchronisée(s) !`, severity: 'success' });
        }
        if (errorCount > 0) {
            setSnack({ open: true, msg: `⚠️ ${errorCount} vente(s) n'ont pas pu être synchronisée(s).`, severity: 'error' });
        }
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncQueue]);

    const allNavItems = [
        { label: 'Dashboard', value: '/', icon: <DashboardIcon />, roles: ['patron', 'vendeur'] },
        { label: 'Stock', value: '/stock', icon: <PointOfSaleIcon />, roles: ['patron', 'vendeur'] },
        { label: 'Journal', value: '/ventes', icon: <ReceiptLongIcon />, roles: ['patron', 'vendeur'] },
        { label: 'Produits', value: '/produits', icon: <CategoryIcon />, roles: ['patron'] },
    ];

    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = allNavItems.filter(item => !role || item.roles.includes(role));

    const showBanner = !isOnline || syncing;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Offline / Syncing Banner */}
            {showBanner && (
                <Box sx={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                    bgcolor: syncing ? 'info.main' : 'warning.main',
                    color: 'white',
                    py: 0.75, px: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                }}>
                    {syncing ? (
                        <SyncIcon fontSize="small" sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
                    ) : (
                        <WifiOffIcon fontSize="small" />
                    )}
                    <Typography variant="body2" fontWeight="bold">
                        {syncing
                            ? 'Synchronisation en cours…'
                            : 'Mode hors-ligne — Vos ventes seront synchronisées à la reconnexion'}
                    </Typography>
                </Box>
            )}

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', pt: showBanner ? '40px' : 0 },
                    }}
                >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                        <Box component="img" src="/logo.png" alt="FORCE Logo" sx={{ height: 40, width: 40, borderRadius: 1 }} />
                        <Typography variant="h5" fontWeight="bold" color="primary.main">FORCE</Typography>
                    </Box>

                    {!isOnline && (
                        <Box sx={{ mx: 2, mb: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WifiOffIcon fontSize="small" color="warning" />
                            <Typography variant="caption" color="warning.dark" fontWeight="bold">Hors-ligne</Typography>
                        </Box>
                    )}

                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.value} disablePadding>
                                <ListItemButton
                                    selected={location.pathname === item.value}
                                    onClick={() => navigate(item.value)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
                                <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Déconnexion" />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                </Drawer>
            )}

            <Box component="main" sx={{ flexGrow: 1, p: 3, pb: isMobile ? 10 : 3, pt: showBanner ? 7 : 3 }}>
                <Outlet />
            </Box>

            {isMobile && (
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={location.pathname}
                        onChange={(_, newValue) => navigate(newValue)}
                    >
                        {navItems.map((item) => (
                            <BottomNavigationAction key={item.value} label={item.label} value={item.value} icon={item.icon} />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}

            {/* Sync result toast */}
            <Snackbar
                open={snack.open}
                autoHideDuration={5000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: showBanner ? 5 : 0 }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">
                    {snack.msg}
                </Alert>
            </Snackbar>

            {/* Prompt Installation PWA */}
            <PWAInstallPrompt />
        </Box>
    );
};

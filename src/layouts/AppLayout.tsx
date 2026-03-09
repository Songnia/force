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
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Divider as MuiDivider,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
    const user = useAuthStore((s) => s.user);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

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

                    <Box sx={{ mt: 'auto', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <ListItemButton
                            onClick={handleOpenMenu}
                            sx={{
                                borderRadius: 3,
                                py: 1,
                                px: 1.5,
                                bgcolor: openMenu ? 'action.selected' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: 'primary.main',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {user?.nom?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" noWrap fontWeight="bold">
                                        {user?.nom || 'Utilisateur'}
                                    </Typography>
                                    <Typography variant="caption" noWrap color="text.secondary" display="block">
                                        {user?.email || 'email@example.com'}
                                    </Typography>
                                </Box>
                                <KeyboardArrowDownIcon
                                    fontSize="small"
                                    sx={{
                                        color: 'text.secondary',
                                        transform: openMenu ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                            </Box>
                        </ListItemButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleCloseMenu}
                            onClick={handleCloseMenu}
                            transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                            anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                            PaperProps={{
                                sx: {
                                    mt: -1,
                                    width: 250,
                                    borderRadius: 3,
                                    boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
                                    overflow: 'visible',
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        bottom: -10,
                                        left: 48,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {user?.nom?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="subtitle1" noWrap fontWeight="bold">
                                        {user?.nom || 'Utilisateur'}
                                    </Typography>
                                    <Typography variant="body2" noWrap color="text.secondary">
                                        {user?.email || 'email@example.com'}
                                    </Typography>
                                </Box>
                            </Box>

                            <MuiDivider sx={{ my: 1 }} />

                            <MenuItem sx={{ py: 1.2, px: 2, gap: 2 }}>
                                <LanguageIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <ListItemText primary="Français" />
                                <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </MenuItem>

                            <MenuItem sx={{ py: 1.2, px: 2, gap: 2 }}>
                                <CreditCardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <ListItemText primary="Mon abonnement" />
                            </MenuItem>

                            <MenuItem sx={{ py: 1.2, px: 2, gap: 2 }}>
                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <ListItemText primary="Mon Profil" />
                            </MenuItem>

                            <MenuItem sx={{ py: 1.2, px: 2, gap: 2 }}>
                                <HelpOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                <ListItemText primary="Centre d'aide" />
                            </MenuItem>

                            <MuiDivider sx={{ my: 1 }} />

                            <MenuItem
                                onClick={handleLogout}
                                sx={{ py: 1.2, px: 2, gap: 2, color: 'error.main' }}
                            >
                                <LogoutIcon fontSize="small" />
                                <ListItemText primary="Se déconnecter" />
                            </MenuItem>
                        </Menu>
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

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Paper, IconButton } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';

// Extending Window interface to include beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Liste d'écoute pour l'événement d'installation
        const handleBeforeInstallPrompt = (e: Event) => {
            // Empêche Chrome 67 et antérieur d'afficher automatiquement l'invite d'installation
            e.preventDefault();

            // Stocke l'événement pour pouvoir le déclencher plus tard
            setInstallPromptEvent(e as BeforeInstallPromptEvent);

            // Affiche l'invite personnalisée après quelques secondes ou si non refusée récemment (via localStorage)
            const hasDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
            if (!hasDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Si l'application a déjà été installée on capture cet événement aussi
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setInstallPromptEvent(null);
            console.log('PWA a été installée avec succès');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPromptEvent) return;

        // Affiche l'invite système (le prompt natif)
        await installPromptEvent.prompt();

        // Attend la réponse de l'utilisateur
        const { outcome } = await installPromptEvent.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        // Efface l'événement stocké, il ne peut être utilisé qu'une seule fois
        setInstallPromptEvent(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // On mémorise que l'utilisateur a refusé pour ne pas le spammer (ex: pendant 7 jours)
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <Snackbar
            open={showPrompt}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ mb: 8 }} // un peu plus haut pour le mobile qui a la navbar en bas
        >
            <Paper elevation={4} sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 3,
                maxWidth: '90vw'
            }}>
                <InstallMobileIcon fontSize="large" sx={{ opacity: 0.9 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Installez l'Application FORCE
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.2, mb: 1 }}>
                        Pour une expérience plus rapide et le support du mode hors-ligne natif.
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={handleInstallClick}
                        fullWidth
                        sx={{ mt: 0.5, borderRadius: 2 }}
                    >
                        Installer Maintenant
                    </Button>
                </Box>
                <IconButton size="small" onClick={handleDismiss} sx={{ color: 'white', alignSelf: 'flex-start', mt: -1, mr: -1 }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Snackbar>
    );
};

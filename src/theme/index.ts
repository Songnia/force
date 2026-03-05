import { createTheme } from '@mui/material/styles';

const seedColor = '#E65100';

export const theme = createTheme({
    palette: {
        primary: {
            main: seedColor,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#5C6BC0',
        },
        error: {
            main: '#B3261E',
            contrastText: '#FFFFFF',
        },
        warning: {
            main: '#F57F17',
            contrastText: '#000000',
        },
        success: {
            main: '#2E7D32',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#FFF8F5',
            paper: '#FFF8F5',
        },
        text: {
            primary: '#1C1B1F',
            secondary: '#4A4543',
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '32px', fontWeight: 700 }, // Headline Large
        h2: { fontSize: '28px', fontWeight: 700 }, // Headline Medium
        h3: { fontSize: '22px', fontWeight: 600 }, // Title Large
        h4: { fontSize: '16px', fontWeight: 600 }, // Title Medium
        body1: { fontSize: '16px', fontWeight: 400 }, // Body Large
        body2: { fontSize: '14px', fontWeight: 400 }, // Body Medium
        button: { fontSize: '14px', fontWeight: 500, textTransform: 'none' }, // Label Large
        caption: { fontSize: '11px', fontWeight: 500 }, // Label Small
    },
    shape: {
        borderRadius: 12, // Level 1 default
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

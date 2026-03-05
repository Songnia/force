import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Chip,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';

import { pdf } from '@react-pdf/renderer';
import { ReceiptDocument } from '../utils/pdf';
import { articlesAPI, ventesAPI, creditsAPI } from '../utils/api';

export const Ventes = () => {
    const [tabValue, setTabValue] = useState(0);
    const [articles, setArticles] = useState<any[]>([]);
    const [historique, setHistorique] = useState<any[]>([]);
    const [credits, setCredits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [histSearchTerm, setHistSearchTerm] = useState('');
    const [periode, setPeriode] = useState('tout');
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as any });

    // Credit Payment state
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedCredit, setSelectedCredit] = useState<any>(null);
    const [payMontant, setPayMontant] = useState('');
    const [payNotes, setPayNotes] = useState('');
    const [paying, setPaying] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [artRes, ventRes, credRes] = await Promise.all([
                articlesAPI.list(),
                ventesAPI.list(),
                creditsAPI.list()
            ]);
            setArticles(artRes.data.filter((a: any) => a.statut === 'actif'));
            setHistorique(ventRes.data);
            setCredits(credRes.data);
        } catch (e) {
            console.error('Erreur chargement données Ventes', e);
            setSnack({ open: true, msg: 'Erreur de chargement', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredHistorique = historique.filter(vente =>
        vente.reference?.toLowerCase().includes(histSearchTerm.toLowerCase()) ||
        vente.user?.nom?.toLowerCase().includes(histSearchTerm.toLowerCase())
    );

    const filteredCredits = credits.filter(c =>
        c.statut !== 'solde' && (
            c.client_nom?.toLowerCase().includes(histSearchTerm.toLowerCase()) ||
            c.vente?.reference?.toLowerCase().includes(histSearchTerm.toLowerCase())
        )
    );

    const handlePayer = async () => {
        setPaying(true);
        try {
            await creditsAPI.payer(selectedCredit.id, { montant: parseFloat(payMontant), notes: payNotes });
            setSnack({ open: true, msg: 'Paiement enregistré', severity: 'success' });
            await loadData();
            setPaymentModalOpen(false);
        } catch (e: any) {
            setSnack({ open: true, msg: e.response?.data?.message || 'Erreur paiement', severity: 'error' });
        } finally {
            setPaying(false);
        }
    };

    const printReceipt = async (vente: any) => {
        const blob = await pdf(<ReceiptDocument vente={vente} />).toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    if (loading && articles.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ pb: 10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h2">Historique des Ventes</Typography>
            </Box>

            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }} variant="fullWidth">
                <Tab label="📑 Historique" />
                {/* <Tab label="💸 Crédits Clients" /> */}
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher par référence..."
                                value={histSearchTerm}
                                onChange={(e) => setHistSearchTerm(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField select fullWidth label="Période" value={periode} onChange={(e) => setPeriode(e.target.value)}>
                                <MenuItem value="tout">Toutes les dates</MenuItem>
                                <MenuItem value="7jours">7 derniers jours</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'surfaceVariant.main' }}>
                                <TableRow>
                                    <TableCell>Référence</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistorique.map((vente) => (
                                    <TableRow key={vente.id} hover>
                                        <TableCell sx={{ py: 2 }}>
                                            <Typography fontWeight="bold">{vente.reference}</Typography>
                                            {vente.credit && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Client: {vente.credit.client_nom}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(vente.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={vente.type === 'comptant' ? 'Cash' : 'Crédit'} color={vente.type === 'comptant' ? 'success' : 'error'} size="small" />
                                        </TableCell>
                                        <TableCell align="right">{vente.total.toLocaleString()} F</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => printReceipt(vente)}><ReceiptLongIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Crédits dont le paiement n'est pas encore complet.</Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'error.light' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Client</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reste à payer</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCredits.map((c) => (
                                    <TableRow key={c.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="bold">{c.client_nom}</Typography>
                                            <Typography variant="caption">{c.client_telephone || 'Pas de téléphone'}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                            {(c.montant_total - c.montant_paye).toLocaleString()} FCFA
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                startIcon={<PaymentIcon />}
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedCredit(c);
                                                    setPayMontant(String(c.montant_total - c.montant_paye));
                                                    setPayNotes('');
                                                    setPaymentModalOpen(true);
                                                }}
                                            >
                                                Payer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Modal Encaisser Crédit */}
            <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Paiement du crédit — {selectedCredit?.client_nom}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField label="Montant à encaisser (FCFA)" type="number" fullWidth value={payMontant} onChange={(e) => setPayMontant(e.target.value)} autoFocus />
                        <TextField label="Notes / Commentaire" multiline rows={2} fullWidth value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPaymentModalOpen(false)}>Annuler</Button>
                    <Button variant="contained" color="success" onClick={handlePayer} disabled={paying || !payMontant}>
                        {paying ? <CircularProgress size={24} /> : 'Valider l\'encaissement'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert severity={snack.severity}>{snack.msg}</Alert>
            </Snackbar>

        </Box>
    );
};

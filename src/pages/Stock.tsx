import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem,
    Tabs,
    Tab,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputAdornment,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    CircularProgress,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Divider,
    Fab,
    Drawer,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningIcon from '@mui/icons-material/Warning';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { stocksAPI, articlesAPI, ventesAPI, dashboardAPI } from '../utils/api';

export const Stock = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [periode, setPeriode] = useState('tout');
    const [loading, setLoading] = useState(true);

    const [articles, setArticles] = useState<any[]>([]);
    const [historique, setHistorique] = useState<any[]>([]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMvt, setSelectedMvt] = useState<any>(null);

    const [notif, setNotif] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
    const [todayStats, setTodayStats] = useState<any>(null);

    // POS State
    const [cart, setCart] = useState<{ id: number; nom: string; prix_vente: number; cout_livraison: number; quantite: number }[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [posSearchTerm, setPosSearchTerm] = useState('');
    const [avecLivraison, setAvecLivraison] = useState(false);

    // Form state for new movement
    const [formData, setFormData] = useState({
        article_id: '',
        type: 'entrée',
        quantite: '',
        prix_unitaire: '',
        notes: '',
        // Credit-specific fields
        client_nom: '',
        client_telephone: '',
        montant_paye: '',
        echeance: '',
        avec_livraison: false
    });

    const addToCart = (article: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === article.id);
            if (existing) {
                return prev.map(item => item.id === article.id ? { ...item, quantite: item.quantite + 1 } : item);
            }
            return [...prev, { id: article.id, nom: article.nom, prix_vente: article.prix_vente, cout_livraison: article.cout_livraison || 0, quantite: 1 }];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantite + delta;
                return newQ > 0 ? { ...item, quantite: newQ } : item;
            }
            return item;
        }).filter(item => item.quantite > 0));
    };

    const totalArticles = cart.reduce((acc, item) => acc + (item.prix_vente * item.quantite), 0);
    const totalLivraison = avecLivraison ? cart.reduce((acc, item) => acc + (item.cout_livraison * item.quantite), 0) : 0;
    const totalCart = totalArticles + totalLivraison;

    const finalizeSale = async () => {
        const reference = `VT-${Date.now()}`;
        const lignes = cart.map(item => ({
            article_id: item.id,
            quantite: item.quantite,
            prix_unitaire: item.prix_vente,
        }));
        try {
            await ventesAPI.create({
                reference,
                type: 'comptant',
                total: totalCart,
                montant_recu: totalCart,
                monnaie_rendue: 0,
                avec_livraison: avecLivraison,
                frais_livraison: totalLivraison,
                lignes,
            });
            setNotif({ open: true, msg: `Vente enregistrée ! ${avecLivraison && totalLivraison > 0 ? `(+${totalLivraison.toLocaleString()} F livraison)` : ''}`, severity: 'success' });
            setCart([]);
            setAvecLivraison(false);
            setCartOpen(false);
            loadData();
        } catch (e: any) {
            console.error('Erreur enregistrement vente', e);
            setNotif({ open: true, msg: 'Erreur lors de la vente', severity: 'error' });
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [artRes, histRes, statsRes] = await Promise.all([
                articlesAPI.list(),
                stocksAPI.list(),
                dashboardAPI.getStats('7j')
            ]);
            setArticles(artRes.data);
            setHistorique(histRes.data);

            // Extract today's stats from daily_stats
            const todayStr = new Date().toISOString().split('T')[0];
            const todayData = statsRes.data.daily_stats?.find((s: any) => s.date === todayStr);
            setTodayStats(todayData || { revenue: 0, profit: 0, transactions: 0 });

        } catch (error) {
            console.error('Error loading stock data:', error);
            setNotif({ open: true, msg: 'Erreur de chargement', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                article_id: formData.article_id,
                type: formData.type,
                quantite: formData.quantite,
                prix_unitaire: formData.prix_unitaire || undefined,
                notes: formData.notes,
                date: new Date().toISOString(),
            };

            // Include credit info if type is crédit
            if (formData.type === 'crédit') {
                payload.client_nom = formData.client_nom;
                payload.client_telephone = formData.client_telephone;
                payload.montant_paye = formData.montant_paye ? parseFloat(formData.montant_paye) : 0;
                payload.echeance = formData.echeance || undefined;
            }

            if (formData.type === 'sortie' || formData.type === 'crédit') {
                payload.avec_livraison = formData.avec_livraison;
            }

            await stocksAPI.create(payload);

            setNotif({ open: true, msg: 'Mouvement enregistré !', severity: 'success' });
            setFormData({ article_id: '', type: 'entrée', quantite: '', prix_unitaire: '', notes: '', client_nom: '', client_telephone: '', montant_paye: '', echeance: '', avec_livraison: false });
            setTabValue(0);
            loadData();
        } catch (error: any) {
            setNotif({ open: true, msg: 'Erreur: ' + (error.response?.data?.error || error.message), severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!selectedMvt) return;
        try {
            await stocksAPI.delete(selectedMvt.id);
            setNotif({ open: true, msg: 'Mouvement supprimé', severity: 'success' });
            setDeleteModalOpen(false);
            loadData();
        } catch (error) {
            setNotif({ open: true, msg: 'Erreur lors de la suppression', severity: 'error' });
        }
    };

    const filteredHistorique = historique.filter(mvt => {
        const artName = mvt.article?.nom || '';
        const notes = mvt.notes || '';
        const matchSearch = artName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notes.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    if (loading && historique.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ pb: 10 }}>
            <Typography variant="h2" sx={{ mb: 3, fontWeight: 'bold' }}>Gestion des Stocks</Typography>

            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 2, p: 0.5 }}
                variant="fullWidth"
            >
                <Tab icon={<PointOfSaleIcon />} label="Caisse" sx={{ minHeight: 70, fontSize: '1rem' }} />
                <Tab icon={<HistoryIcon />} label="📑 Historique" sx={{ minHeight: 70, fontSize: '1rem' }} />
                <Tab icon={<AddCircleIcon />} label="Ajouter / Sortir" sx={{ minHeight: 70, fontSize: '1rem' }} />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    {/* Bilan du jour simplifié */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <Card elevation={0} sx={{ flex: 1, minWidth: 150, bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>C.A Aujourd'hui</Typography>
                                <Typography variant="h5" fontWeight="bold">{(todayStats?.revenue || 0).toLocaleString()} F</Typography>
                            </CardContent>
                        </Card>
                        <Card elevation={0} sx={{ flex: 1, minWidth: 150, bgcolor: 'info.main', color: 'white', borderRadius: 2 }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Bénéfice Jour</Typography>
                                <Typography variant="h5" fontWeight="bold">{(todayStats?.profit || 0).toLocaleString()} F</Typography>
                            </CardContent>
                        </Card>
                        <Card elevation={0} sx={{ flex: 1, minWidth: 120, bgcolor: 'secondary.main', color: 'white', borderRadius: 2 }}>
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Ventes</Typography>
                                <Typography variant="h5" fontWeight="bold">{todayStats?.transactions || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Rechercher un article..."
                        value={posSearchTerm}
                        onChange={(e) => setPosSearchTerm(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                            sx: { borderRadius: 2, bgcolor: 'background.paper', height: 60 }
                        }}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                        {articles.filter(a => a.statut === 'actif' && a.nom.toLowerCase().includes(posSearchTerm.toLowerCase())).map((art: any) => (
                            <Card key={art.id} sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} onClick={() => addToCart(art)}>
                                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" noWrap sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{art.nom}</Typography>
                                    <Typography variant="body1" color="primary.main" fontWeight="900" sx={{ mt: 0.5, mb: 1.5 }}>
                                        {art.prix_vente.toLocaleString()} FCFA
                                    </Typography>

                                    <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5, mb: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Vendu</Typography>
                                            <Typography variant="caption" fontWeight="bold">
                                                {art.vendu_aujourdhui > 0 && <Box component="span" sx={{ color: 'success.main', mr: 0.5 }}>+{art.vendu_aujourdhui}</Box>}
                                                {art.total_vendu || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">Total (F)</Typography>
                                            <Typography variant="caption" fontWeight="bold" color="success.main">
                                                {(art.revenue || 0).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Bénéfice</Typography>
                                            <Typography variant="caption" fontWeight="bold" color="info.main">
                                                {(art.profit || 0).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color={art.qte_actuelle <= art.seuil_alerte ? "error.main" : "text.secondary"} sx={{ fontSize: '0.85rem' }}>
                                        Plein: <b>{art.qte_actuelle}</b> • Vide: <b>{art.qte_vide}</b>
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {cart.length > 0 && (
                        <Fab
                            variant="extended"
                            color="primary"
                            onClick={() => setCartOpen(true)}
                            sx={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, px: 4, height: 60 }}
                        >
                            <PointOfSaleIcon sx={{ mr: 1 }} />
                            Panier ({cart.reduce((a, c) => a + c.quantite, 0)}) • {totalCart.toLocaleString()} F
                        </Fab>
                    )}

                    <Drawer
                        anchor="bottom"
                        open={cartOpen}
                        onClose={() => setCartOpen(false)}
                        PaperProps={{ sx: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85vh' } }}
                    >
                        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h2">Votre Panier</Typography>
                                <IconButton onClick={() => setCartOpen(false)}><CloseIcon /></IconButton>
                            </Box>

                            <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                                {cart.map((item) => (
                                    <ListItem key={item.id} sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={<Typography variant="h4">{item.nom}</Typography>}
                                            secondary={`${item.prix_vente.toLocaleString()} FCFA`}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <IconButton size="medium" onClick={() => updateQuantity(item.id, -1)} sx={{ bgcolor: 'error.light', color: 'white' }}>
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography variant="h4" sx={{ minWidth: 30, textAlign: 'center' }}>{item.quantite}</Typography>
                                            <IconButton size="medium" onClick={() => updateQuantity(item.id, 1)} sx={{ bgcolor: 'primary.light', color: 'white' }}>
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ mb: 2 }} />

                            {/* Option livraison */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: avecLivraison ? 'primary.main' : 'action.hover', borderRadius: 2, p: 2, mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" color={avecLivraison ? 'white' : 'text.primary'} fontWeight="bold">🚚 Livraison</Typography>
                                    {avecLivraison && totalLivraison > 0 && (
                                        <Typography variant="caption" color="white">+{totalLivraison.toLocaleString()} FCFA</Typography>
                                    )}
                                    {avecLivraison && totalLivraison === 0 && (
                                        <Typography variant="caption" color="warning.light">Coût livraison non défini pour ces articles</Typography>
                                    )}
                                </Box>
                                <Button
                                    variant={avecLivraison ? 'contained' : 'outlined'}
                                    color={avecLivraison ? 'success' : 'inherit'}
                                    size="small"
                                    onClick={() => setAvecLivraison(!avecLivraison)}
                                    sx={{ borderRadius: 2, bgcolor: avecLivraison ? 'success.main' : 'background.paper', minWidth: 90 }}
                                >
                                    {avecLivraison ? '✓ Avec' : 'Sans'}
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" color="text.secondary">Articles</Typography>
                                <Typography variant="body1">{totalArticles.toLocaleString()} FCFA</Typography>
                            </Box>
                            {avecLivraison && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body1" color="primary.main">🚚 Livraison</Typography>
                                    <Typography variant="body1" color="primary.main">+{totalLivraison.toLocaleString()} FCFA</Typography>
                                </Box>
                            )}
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h3">NET À PAYER</Typography>
                                <Typography variant="h3" color="primary.main">{totalCart.toLocaleString()} FCFA</Typography>
                            </Box>

                            <Button variant="contained" color="success" size="large" fullWidth sx={{ py: 2, borderRadius: 2 }} onClick={finalizeSale}>
                                Encaisser Cash
                            </Button>
                        </Box>
                    </Drawer>
                </Box>
            )}

            {tabValue === 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card elevation={0} sx={{ maxWidth: 700, width: '100%', borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: isMobile ? 3 : 5 }}>
                            <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', color: 'primary.main' }}>
                                Nouveau Mouvement
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <TextField
                                    select
                                    label="Quel article ?"
                                    value={formData.article_id}
                                    onChange={(e) => {
                                        const artId = e.target.value;
                                        const selectedArt = articles.find(a => a.id === artId);
                                        let defaultPrice = '';
                                        if (selectedArt) {
                                            defaultPrice = formData.type === 'entrée'
                                                ? selectedArt.prix_achat.toString()
                                                : selectedArt.prix_vente.toString();
                                        }
                                        setFormData({
                                            ...formData,
                                            article_id: artId,
                                            prix_unitaire: defaultPrice
                                        });
                                    }}
                                    required
                                    fullWidth
                                    InputProps={{ sx: { borderRadius: 2, fontSize: '1.2rem', height: 70 } }}
                                    InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                >
                                    {articles.map((art) => (
                                        <MenuItem key={art.id} value={art.id} sx={{ py: 2, fontSize: '1.1rem' }}>
                                            {art.nom} — <Typography component="span" fontWeight="bold" color="primary">Pleins: {art.qte_actuelle} | Vides: {art.qte_vide}</Typography>
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    label="Action à effectuer"
                                    value={formData.type}
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        const selectedArt = articles.find(a => a.id === formData.article_id);
                                        let newPrice = formData.prix_unitaire;
                                        if (selectedArt) {
                                            newPrice = newType === 'entrée'
                                                ? selectedArt.prix_achat.toString()
                                                : selectedArt.prix_vente.toString();
                                        }
                                        setFormData({ ...formData, type: newType, prix_unitaire: newPrice });
                                    }}
                                    required
                                    fullWidth
                                    InputProps={{ sx: { borderRadius: 2, fontSize: '1.2rem', height: 70 } }}
                                    InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                >
                                    <MenuItem value="entrée" sx={{ py: 2, fontSize: '1.1rem' }}>➕ Ajouter du stock</MenuItem>
                                    <MenuItem value="sortie" sx={{ py: 2, fontSize: '1.1rem' }}>➖ Vente</MenuItem>
                                    {/* <MenuItem value="crédit" sx={{ py: 2, fontSize: '1.1rem' }}>💸 Crédit Client</MenuItem> */}
                                    <MenuItem value="perte" sx={{ py: 2, fontSize: '1.1rem' }}>⚠️ Perte</MenuItem>
                                    <MenuItem value="autre" sx={{ py: 2, fontSize: '1.1rem' }}>ℹ️ Autre raison</MenuItem>
                                </TextField>

                                {(formData.type === 'sortie' || formData.type === 'crédit') && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: formData.avec_livraison ? 'primary.main' : 'action.hover', borderRadius: 2, p: 2 }}>
                                        <Box>
                                            <Typography variant="h6" color={formData.avec_livraison ? 'white' : 'text.primary'} fontWeight="bold">🚚 Inclure la Livraison ?</Typography>
                                            <Typography variant="caption" color={formData.avec_livraison ? 'white' : 'text.secondary'}>
                                                500 FCFA
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant={formData.avec_livraison ? 'contained' : 'outlined'}
                                            color={formData.avec_livraison ? 'success' : 'inherit'}
                                            onClick={() => setFormData({ ...formData, avec_livraison: !formData.avec_livraison })}
                                            sx={{ borderRadius: 2, bgcolor: formData.avec_livraison ? 'success.main' : 'background.paper', minWidth: 100 }}
                                        >
                                            {formData.avec_livraison ? '✓ OUI' : 'NON'}
                                        </Button>
                                    </Box>
                                )}

                                <TextField
                                    label="Combien d'articles ?"
                                    type="number"
                                    value={formData.quantite}
                                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                                    required
                                    fullWidth
                                    InputProps={{
                                        sx: { borderRadius: 2, fontSize: '1.5rem', height: 80, textAlign: 'center' },
                                        inputProps: { min: 1, style: { textAlign: 'center' } }
                                    }}
                                    InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                />

                                <TextField
                                    label={formData.type === 'entrée' ? "Prix d'achat unitaire (FCFA)" : "Prix de vente unitaire (FCFA)"}
                                    type="number"
                                    value={formData.prix_unitaire}
                                    onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                                    fullWidth
                                    InputProps={{ sx: { borderRadius: 2, fontSize: '1.2rem', height: 70 } }}
                                    InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                />

                                {formData.type === 'crédit' && (
                                    <>
                                        <TextField
                                            label="Nom du client *"
                                            value={formData.client_nom}
                                            onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                                            required
                                            fullWidth
                                            InputProps={{ sx: { borderRadius: 2, height: 70, fontSize: '1.2rem' } }}
                                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                        />
                                        <TextField
                                            label="Téléphone du client"
                                            value={formData.client_telephone}
                                            onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
                                            fullWidth
                                            InputProps={{ sx: { borderRadius: 2, height: 70, fontSize: '1.2rem' } }}
                                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                        />
                                        <TextField
                                            label="Montant déjà payé (Avance)"
                                            type="number"
                                            value={formData.montant_paye}
                                            onChange={(e) => setFormData({ ...formData, montant_paye: e.target.value })}
                                            fullWidth
                                            InputProps={{ sx: { borderRadius: 2, height: 70, fontSize: '1.2rem' } }}
                                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                        />
                                        <TextField
                                            label="Date d'échéance"
                                            type="date"
                                            value={formData.echeance}
                                            onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
                                            fullWidth
                                            InputLabelProps={{ shrink: true, sx: { fontSize: '1.1rem' } }}
                                            InputProps={{ sx: { borderRadius: 2, height: 70 } }}
                                        />
                                    </>
                                )}

                                <Button
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    sx={{ py: 3, borderRadius: 5, fontSize: '1.3rem', mt: 2, boxShadow: 6 }}
                                    color={formData.type === 'entrée' ? 'success' : 'primary'}
                                >
                                    Valider et Enregistrer
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher un article ou un motif..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                    sx: { borderRadius: 2, bgcolor: 'background.paper', height: 60, fontSize: '1.1rem' }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select
                                fullWidth
                                label="Période"
                                value={periode}
                                onChange={(e) => setPeriode(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2, height: 60, bgcolor: 'background.paper' } }}
                            >
                                <MenuItem value="tout">Toutes les dates</MenuItem>
                                <MenuItem value="aujourdhui">Aujourd'hui</MenuItem>
                                <MenuItem value="7jours">7 derniers jours</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    {isMobile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {filteredHistorique.map((mvt) => (
                                <Card key={mvt.id} sx={{ borderRadius: 2, borderLeft: '6px solid', borderLeftColor: mvt.type === 'entrée' ? 'success.main' : 'error.main' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Typography variant="h4" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{mvt.article?.nom}</Typography>
                                            <Typography variant="body1" fontWeight="900" color={mvt.type === 'entrée' ? 'success.main' : 'error.main'} sx={{ fontSize: '1.3rem' }}>
                                                {mvt.type === 'entrée' ? '+' : '-'}{mvt.quantite}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            {mvt.type === 'entrée' ? <ArrowUpwardIcon color="success" fontSize="small" /> : <ArrowDownwardIcon color="error" fontSize="small" />}
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(mvt.date).toLocaleDateString()} • {mvt.type === 'entrée' ? 'Ajout' : 'Retrait'}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', maxWidth: '70%', color: 'text.secondary' }}>
                                                {mvt.notes || 'Aucune note'}
                                            </Typography>
                                            <IconButton color="error" onClick={() => { setSelectedMvt(mvt); setDeleteModalOpen(true); }} size="large">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: 'surfaceVariant.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Mouvement</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredHistorique.map((mvt) => (
                                        <TableRow key={mvt.id} hover>
                                            <TableCell sx={{ py: 2.5 }}>{new Date(mvt.date).toLocaleDateString()}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{mvt.article?.nom}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={mvt.type === 'entrée' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                                    label={mvt.type === 'entrée' ? 'ENTRÉE' : 'SORTIE'}
                                                    color={mvt.type === 'entrée' ? 'success' : 'error'}
                                                    size="medium"
                                                    sx={{ fontWeight: '900', px: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="h4"
                                                    fontWeight="900"
                                                    color={mvt.type === 'entrée' ? 'success.main' : 'error.main'}
                                                >
                                                    {mvt.type === 'entrée' ? '+' : '-'}{mvt.quantite}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary', maxWidth: 200 }}>{mvt.notes}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => { setSelectedMvt(mvt); setDeleteModalOpen(true); }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            <Dialog
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', pb: 1 }}>
                    <WarningIcon color="error" />
                    Annuler le mouvement
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1.1rem' }}>
                        Voulez-vous vraiment supprimer ce mouvement ? <br />
                        <Typography component="span" fontWeight="bold">Cette action remettra le stock à son état précédent.</Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteModalOpen(false)} sx={{ fontSize: '1.1rem' }}>Non, Annuler</Button>
                    <Button color="error" variant="contained" onClick={handleDelete} sx={{ borderRadius: 2, px: 3, py: 1.5, fontSize: '1.1rem' }}>
                        Oui, Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notif.open}
                autoHideDuration={4000}
                onClose={() => setNotif({ ...notif, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert variant="filled" severity={notif.severity} sx={{ width: '100%', borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}>
                    {notif.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

import { useState, useEffect } from 'react';
import {
    Box, Typography, List, ListItem, ListItemText, Fab, Accordion, AccordionSummary,
    AccordionDetails, Button, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, DialogContentText, TextField, CircularProgress, Alert, Snackbar, Chip,
    useMediaQuery, useTheme, Divider, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';

import { articlesAPI, categoriesAPI } from '../utils/api';
import { ProtectedByRole } from '../components/ProtectedByRole';

export const Produits = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expanded, setExpanded] = useState<string | false>(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as any });

    // Catégorie modals
    const [categModal, setCategModal] = useState(false);
    const [editCategModal, setEditCategModal] = useState(false);
    const [deleteCategModal, setDeleteCategModal] = useState(false);
    const [selectedCateg, setSelectedCateg] = useState<any>(null);
    const [categForm, setCategForm] = useState({ nom: '', couleur: '#FF6B35' });

    // Article modals
    const [articleModal, setArticleModal] = useState(false);
    const [editArticleModal, setEditArticleModal] = useState(false);
    const [deleteArticleModal, setDeleteArticleModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [targetCategId, setTargetCategId] = useState<number | null>(null);
    const [articleForm, setArticleForm] = useState({
        nom: '', reference: '', unite: 'unité',
        prix_achat: '', prix_vente: '', cout_livraison: '', qte_actuelle: '', qte_vide: '', seuil_alerte: ''
    });

    const loadData = async () => {
        try {
            const { data } = await categoriesAPI.list();
            setCategories(data);
        } catch {
            setSnack({ open: true, msg: 'Erreur chargement données', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const saveCateg = async () => {
        try {
            if (selectedCateg) {
                await categoriesAPI.update(selectedCateg.id, categForm);
            } else {
                await categoriesAPI.create(categForm);
            }
            await loadData();
            setCategModal(false); setEditCategModal(false);
            setSnack({ open: true, msg: 'Catégorie enregistrée', severity: 'success' });
        } catch (e: any) {
            setSnack({ open: true, msg: e.response?.data?.message || 'Erreur', severity: 'error' });
        }
    };

    const deleteCateg = async () => {
        try {
            await categoriesAPI.delete(selectedCateg.id);
            await loadData();
            setDeleteCategModal(false);
            setSnack({ open: true, msg: 'Catégorie supprimée', severity: 'success' });
        } catch {
            setSnack({ open: true, msg: 'Impossible de supprimer (articles liés ?)', severity: 'error' });
        }
    };

    const saveArticle = async () => {
        const payload = {
            ...articleForm,
            categorie_id: targetCategId,
            prix_achat: parseFloat(articleForm.prix_achat) || 0,
            prix_vente: parseFloat(articleForm.prix_vente) || 0,
            cout_livraison: parseFloat(articleForm.cout_livraison) || 0,
            qte_actuelle: parseFloat(articleForm.qte_actuelle) || 0,
            qte_vide: parseFloat(articleForm.qte_vide) || 0,
            seuil_alerte: parseFloat(articleForm.seuil_alerte) || 0,
            statut: 'actif',
        };
        try {
            if (selectedArticle) {
                await articlesAPI.update(selectedArticle.id, payload);
            } else {
                await articlesAPI.create(payload);
            }
            await loadData();
            setArticleModal(false); setEditArticleModal(false);
            setSnack({ open: true, msg: 'Article enregistré', severity: 'success' });
        } catch (e: any) {
            setSnack({ open: true, msg: e.response?.data?.message || 'Erreur', severity: 'error' });
        }
    };

    const deleteArticle = async () => {
        try {
            await articlesAPI.delete(selectedArticle.id);
            await loadData();
            setDeleteArticleModal(false);
            setSnack({ open: true, msg: 'Article supprimé', severity: 'success' });
        } catch {
            setSnack({ open: true, msg: 'Erreur suppression', severity: 'error' });
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ pb: 10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" fontWeight="bold">Nos Produits</Typography>
                <ProtectedByRole role="patron" hideCompletely>
                    {!isMobile && (
                        <Button
                            variant="contained"
                            startIcon={<CategoryIcon />}
                            onClick={() => { setSelectedCateg(null); setCategForm({ nom: '', couleur: '#FF6B35' }); setCategModal(true); }}
                            sx={{ borderRadius: 3, px: 3, py: 1.5, fontSize: '1.1rem' }}
                        >
                            Nouvelle Catégorie
                        </Button>
                    )}
                </ProtectedByRole>
            </Box>

            {categories.length === 0 && (
                <Alert severity="info" sx={{ py: 3, borderRadius: 3, fontSize: '1.1rem' }}>
                    Aucune catégorie. Commencez par en créer une pour organiser vos articles.
                </Alert>
            )}

            {categories.map((cat) => (
                <Accordion
                    key={cat.id}
                    expanded={expanded === `cat-${cat.id}`}
                    onChange={() => setExpanded(expanded === `cat-${cat.id}` ? false : `cat-${cat.id}`)}
                    sx={{
                        mb: 2.5,
                        borderRadius: '20px !important',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:before': { display: 'none' }
                    }}
                    elevation={0}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '2rem' }} />} sx={{ minHeight: 90 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mr: 1 }}>
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: cat.couleur || '#FF6B35', border: '2px solid rgba(0,0,0,0.1)' }} />
                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{cat.nom}</Typography>
                            <Chip label={`${cat.articles?.length ?? 0} articles`} size="medium" sx={{ ml: 'auto', fontWeight: 'bold' }} />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <Box sx={{ p: 2, bgcolor: 'surfaceVariant.main', borderRadius: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <ProtectedByRole role="patron">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    onClick={(e) => { e.stopPropagation(); setSelectedCateg(cat); setCategForm({ nom: cat.nom, couleur: cat.couleur || '#FF6B35' }); setEditCategModal(true); }}
                                    sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                                >
                                    Modifier Catégorie
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={(e) => { e.stopPropagation(); setSelectedCateg(cat); setDeleteCategModal(true); }}
                                    sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                                >
                                    Supprimer
                                </Button>
                            </ProtectedByRole>
                        </Box>

                        <List sx={{ p: 0 }}>
                            {(cat.articles || []).map((art: any, index: number) => (
                                <Box key={art.id}>
                                    <ListItem
                                        sx={{
                                            py: 3,
                                            px: isMobile ? 2 : 4,
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            gap: isMobile ? 2 : 0
                                        }}
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <ProtectedByRole role="patron">
                                                    <IconButton
                                                        color="primary"
                                                        sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main' } }}
                                                        onClick={() => { setSelectedArticle(art); setTargetCategId(cat.id); setArticleForm({ nom: art.nom, reference: art.reference, unite: art.unite, prix_achat: art.prix_achat, prix_vente: art.prix_vente, cout_livraison: art.cout_livraison || '', qte_actuelle: art.qte_actuelle, qte_vide: art.qte_vide || '', seuil_alerte: art.seuil_alerte }); setEditArticleModal(true); }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        sx={{ bgcolor: 'error.light', color: 'error.contrastText', '&:hover': { bgcolor: 'error.main' } }}
                                                        onClick={() => { setSelectedArticle(art); setDeleteArticleModal(true); }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ProtectedByRole>
                                            </Box>
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, fontSize: '1.2rem' }}>
                                                    {art.nom}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1, alignItems: 'center' }}>
                                                    <Chip label={`Réf: ${art.reference}`} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Chip
                                                            label={`Stock: ${art.qte_actuelle}`}
                                                            size="small"
                                                            color={art.qte_actuelle <= art.seuil_alerte ? "error" : "success"}
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                        <Chip
                                                            label={`Vides: ${art.qte_vide}`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Typography component="span" fontWeight="900" color="primary.main" sx={{ fontSize: '1.1rem' }}>
                                                        {art.prix_vente.toLocaleString()} FCFA
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < cat.articles.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>

                        <ProtectedByRole role="patron" hideCompletely>
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        setSelectedArticle(null);
                                        setTargetCategId(cat.id);
                                        setArticleForm({ nom: '', reference: '', unite: 'unité', prix_achat: '', prix_vente: '', cout_livraison: '', qte_actuelle: '', qte_vide: '', seuil_alerte: '' });
                                        setArticleModal(true);
                                    }}
                                    sx={{ borderRadius: 2, px: 4, py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                                >
                                    Ajouter un Article à cette catégorie
                                </Button>
                            </Box>
                        </ProtectedByRole>
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* FAB mobile pour nouvelle catégorie */}
            <ProtectedByRole role="patron" hideCompletely>
                {isMobile && (
                    <Fab
                        color="primary"
                        sx={{ position: 'fixed', bottom: 90, right: 20, width: 70, height: 70 }}
                        onClick={() => { setSelectedCateg(null); setCategForm({ nom: '', couleur: '#FF6B35' }); setCategModal(true); }}
                    >
                        <CategoryIcon fontSize="large" />
                    </Fab>
                )}
            </ProtectedByRole>

            {/* ─── Catégorie Modal ─── */}
            <Dialog open={categModal || editCategModal} onClose={() => { setCategModal(false); setEditCategModal(false); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 5, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: '900', fontSize: '1.5rem', pb: 0 }}>
                    {editCategModal ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 4 }}>
                    <TextField
                        label="Nom de la catégorie"
                        fullWidth
                        value={categForm.nom}
                        onChange={(e) => setCategForm({ ...categForm, nom: e.target.value })}
                        InputProps={{ sx: { borderRadius: 3, height: 70, fontSize: '1.2rem' } }}
                        InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                        autoFocus
                    />
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Couleur distinctive</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choisissez une couleur pour reconnaître facilement cette catégorie.</Typography>
                        <input type="color" value={categForm.couleur} onChange={(e) => setCategForm({ ...categForm, couleur: e.target.value })} style={{ width: '100%', height: 60, border: '1px solid #ccc', borderRadius: '12px', cursor: 'pointer', padding: '5px' }} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, mt: 2 }}>
                    <Button onClick={() => { setCategModal(false); setEditCategModal(false); }} sx={{ fontSize: '1.1rem' }}>Annuler</Button>
                    <Button variant="contained" onClick={saveCateg} sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: '1.1rem' }}>Enregistrer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteCategModal} onClose={() => setDeleteCategModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 5, p: 1 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'error.main', fontWeight: '900' }}>
                    <WarningIcon color="error" />
                    Supprimer ?
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <DialogContentText sx={{ fontSize: '1.1rem' }}>
                        Cette action est <Typography component="span" fontWeight="bold" color="error">irréversible</Typography>. <br /><br />
                        Tous les articles contenus dans cette catégorie seront également supprimés.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteCategModal(false)} sx={{ fontSize: '1.1rem' }}>Annuler</Button>
                    <Button color="error" variant="contained" onClick={deleteCateg} sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: '1.1rem' }}>Oui, Tout Supprimer</Button>
                </DialogActions>
            </Dialog>

            {/* ─── Article Modal ─── */}
            <Dialog open={articleModal || editArticleModal} onClose={() => { setArticleModal(false); setEditArticleModal(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 5, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: '900', fontSize: '1.5rem' }}>
                    {editArticleModal ? 'Éditer l\'article' : 'Nouvel Article'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 3, pt: 2 }}>
                        <TextField
                            label="Nom du produit *"
                            fullWidth
                            value={articleForm.nom}
                            onChange={(e) => setArticleForm({ ...articleForm, nom: e.target.value })}
                            sx={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}
                            InputProps={{ sx: { borderRadius: 3, height: 70, fontSize: '1.2rem' } }}
                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                        />
                        <TextField
                            label="Stock Actuel (Pleins)"
                            type="number"
                            fullWidth
                            value={articleForm.qte_actuelle}
                            onChange={(e) => setArticleForm({ ...articleForm, qte_actuelle: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3 } }}
                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                        />
                        <TextField
                            label="Stock Actuel (Vides)"
                            type="number"
                            fullWidth
                            value={articleForm.qte_vide}
                            onChange={(e) => setArticleForm({ ...articleForm, qte_vide: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3 } }}
                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                        />
                        <TextField
                            label="Unité (Kg, Sac, Unité...)"
                            fullWidth
                            value={articleForm.unite}
                            onChange={(e) => setArticleForm({ ...articleForm, unite: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3, height: 70, fontSize: '1.1rem' } }}
                            InputLabelProps={{ sx: { fontSize: '1rem' } }}
                        />
                        <TextField
                            label="Prix deVente (FCFA) *"
                            type="number"
                            fullWidth
                            value={articleForm.prix_vente}
                            onChange={(e) => setArticleForm({ ...articleForm, prix_vente: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">F</InputAdornment>,
                                sx: { borderRadius: 3, height: 70, fontSize: '1.3rem', fontWeight: 'bold' }
                            }}
                            InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                        />
                        <TextField
                            label="⛔ Coût Livraison (FCFA)"
                            type="number"
                            fullWidth
                            value={articleForm.cout_livraison}
                            onChange={(e) => setArticleForm({ ...articleForm, cout_livraison: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">F</InputAdornment>,
                                sx: { borderRadius: 3, height: 70, fontSize: '1.1rem' }
                            }}
                            InputLabelProps={{ sx: { fontSize: '1rem' } }}
                            helperText="Laisser vide = pas de livraison"
                        />
                        <TextField
                            label="Stock Initial"
                            type="number"
                            fullWidth
                            disabled={editArticleModal}
                            value={articleForm.qte_actuelle}
                            onChange={(e) => setArticleForm({ ...articleForm, qte_actuelle: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3, height: 70 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, mt: 2 }}>
                    <Button onClick={() => { setArticleModal(false); setEditArticleModal(false); }} sx={{ fontSize: '1.1rem' }}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={saveArticle}
                        size="large"
                        sx={{ borderRadius: 2, px: 5, py: 2, fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteArticleModal} onClose={() => setDeleteArticleModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 5 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Supprimer cet article ?</DialogTitle>
                <DialogContent><Typography variant="body1">Voulez-vous vraiment supprimer cet article de votre inventaire ?</Typography></DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteArticleModal(false)}>Annuler</Button>
                    <Button color="error" variant="contained" onClick={deleteArticle} sx={{ borderRadius: 2 }}>Supprimer Définitivement</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert variant="filled" severity={snack.severity} sx={{ width: '100%', borderRadius: 3, fontSize: '1.1rem', px: 4 }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

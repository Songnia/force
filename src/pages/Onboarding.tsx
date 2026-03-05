import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoriesAPI, articlesAPI } from '../utils/api';

const steps = ['Nouveau Produit', 'Articles', 'Terminé'];

export const Onboarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [produit, setProduit] = useState('');
    const [articles, setArticles] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAddArticle = () => {
        setArticles([...articles, '']);
    };

    const handleArticleChange = (index: number, value: string) => {
        const newArticles = [...articles];
        newArticles[index] = value;
        setArticles(newArticles);
    };

    const handleRemoveArticle = (index: number) => {
        if (articles.length > 1) {
            const newArticles = articles.filter((_, i) => i !== index);
            setArticles(newArticles);
        }
    };

    const validArticles = articles.filter(a => a.trim() !== '');

    const handleNext = async () => {
        if (activeStep === 0 && produit.trim() === '') return;
        if (activeStep === 1 && validArticles.length === 0) return;

        if (activeStep === 2) {
            setLoading(true);
            setError('');
            try {
                // 1. Create Category
                const catRes = await categoriesAPI.create({
                    nom: produit
                });
                const categorie_id = catRes.data.id;

                // 2. Create Articles sequentially to avoid stock issues or race conditions
                for (let i = 0; i < validArticles.length; i++) {
                    const articleNom = validArticles[i];
                    await articlesAPI.create({
                        nom: articleNom,
                        categorie_id,
                        reference: `ART-${Date.now()}-${i}`,
                        unite: 'unité',
                        prix_achat: 0,
                        prix_vente: 0,
                        qte_actuelle: 0,
                        seuil_alerte: 5,
                        statut: 'actif'
                    });
                }

                // Redirect to dashboard
                navigate('/');
            } catch (err: any) {
                console.error('Onboarding failed:', err);
                setError('Une erreur est survenue lors de l\'enregistrement de vos données.');
                setLoading(false);
            }
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
            <Card elevation={4} sx={{ maxWidth: 500, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 4, textAlign: 'center' }}>
                    <Inventory2Icon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h3">Bienvenue sur FORCE !</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                        Commençons par enregistrer votre premier stock.
                    </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {activeStep === 0 && (
                            <Box>
                                <Typography variant="h4" sx={{ mb: 2 }}>Quel est votre premier type de produit ?</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Exemple: <strong>Gaz</strong>, Boissons, Ciment...
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Nom du Produit"
                                    variant="outlined"
                                    value={produit}
                                    onChange={(e) => setProduit(e.target.value)}
                                    autoFocus
                                />
                            </Box>
                        )}

                        {activeStep === 1 && (
                            <Box>
                                <Typography variant="h4" sx={{ mb: 2 }}>Ajoutez des articles pour "{produit}"</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Quels sont les articles spécifiques pour ce produit ?
                                    <br />Exemple: <strong>Bocom</strong>, <strong>Tradex</strong>...
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {articles.map((article, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                label={`Article ${idx + 1}`}
                                                variant="outlined"
                                                value={article}
                                                onChange={(e) => handleArticleChange(idx, e.target.value)}
                                                autoFocus={idx === articles.length - 1}
                                            />
                                            {articles.length > 1 && (
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveArticle(idx)}
                                                    sx={{ mt: 1, height: 40 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}

                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddArticle}
                                        sx={{ alignSelf: 'flex-start' }}
                                    >
                                        Ajouter un autre article
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {activeStep === 2 && (
                            <Box sx={{ textAlign: 'center' }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                                <Typography variant="h4">Configuration Réussie !</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                    Votre produit <strong>{produit}</strong> a été créé avec {validArticles.length} article(s).
                                </Typography>
                                <List dense sx={{ mt: 2, bgcolor: 'surfaceVariant.main', borderRadius: 2 }}>
                                    {validArticles.map((a, i) => (
                                        <ListItem key={i}>
                                            <ListItemText primary={a} />
                                        </ListItem>
                                    ))}
                                </List>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Appuyez sur le bouton ci-dessous pour commencer à gérer votre commerce.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            disabled={activeStep === 0 || activeStep === 2 || loading}
                            onClick={() => setActiveStep((prev) => prev - 1)}
                        >
                            Retour
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={
                                loading ||
                                (activeStep === 0 && !produit.trim()) ||
                                (activeStep === 1 && validArticles.length === 0)
                            }
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 2 ? 'C\'est parti !' : 'Continuer'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

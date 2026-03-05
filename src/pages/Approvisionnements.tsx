import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    MenuItem
} from '@mui/material';

const mockArticles = [
    { id: 1, nom: 'Sucre en Poudre' },
    { id: 2, nom: 'Huile Végétale 1L' },
];

export const Approvisionnements = () => {
    const [formData, setFormData] = useState({
        article_id: '',
        quantite: '',
        prix_unitaire: '',
        fournisseur: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Stock updated:', formData);
        // In real app, call API
    };

    return (
        <Box sx={{ pb: 8, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h2" sx={{ mb: 3 }}>Approvisionnement</Typography>

            <Card elevation={2}>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            label="Article"
                            value={formData.article_id}
                            onChange={(e) => setFormData({ ...formData, article_id: e.target.value })}
                            required
                        >
                            {mockArticles.map((art) => (
                                <MenuItem key={art.id} value={art.id}>
                                    {art.nom}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Devise / Prix Unitaire Achat"
                            type="number"
                            value={formData.prix_unitaire}
                            onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                            required
                        />

                        <TextField
                            label="Quantité"
                            type="number"
                            value={formData.quantite}
                            onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                            required
                        />

                        <TextField
                            label="Nom du fournisseur (Optionnel)"
                            value={formData.fournisseur}
                            onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                        />

                        <Button variant="contained" size="large" type="submit">
                            Ajouter au stock
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

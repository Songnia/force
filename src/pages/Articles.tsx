import { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Fab,
    TextField,
    InputAdornment,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterListIcon from '@mui/icons-material/FilterList';

// Mock data based on PRD schema
const mockArticles = [
    { id: 1, nom: 'Sucre en Poudre', reference: 'SUC-001', qte_actuelle: 50, seuil_alerte: 10, prix_vente: 800, categorie: 'Alimentation', statut: 'actif' },
    { id: 2, nom: 'Huile Végétale 1L', reference: 'HUI-002', qte_actuelle: 5, seuil_alerte: 20, prix_vente: 1500, categorie: 'Alimentation', statut: 'actif' },
];

export const Articles = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h2">Articles</Typography>
                <IconButton color="primary">
                    <FilterListIcon />
                </IconButton>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3, borderRadius: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: 'surfaceVariant.main' }
                }}
            />

            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                {mockArticles.map((article) => (
                    <ListItem
                        key={article.id}
                        alignItems="flex-start"
                        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: article.qte_actuelle <= article.seuil_alerte ? 'warning.main' : 'primary.main' }}>
                                <InventoryIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            disableTypography
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h4">{article.nom}</Typography>
                                    <Typography variant="h4" color="primary.main">{article.prix_vente} FCFA</Typography>
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Ref: {article.reference}
                                    </Typography>
                                    <Chip
                                        label={`Stock: ${article.qte_actuelle}`}
                                        size="small"
                                        color={article.qte_actuelle <= article.seuil_alerte ? "warning" : "success"}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 80, right: 24, zIndex: 1000 }}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};

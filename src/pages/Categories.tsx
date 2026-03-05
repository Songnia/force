import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Fab,
    Avatar,
    ListItemAvatar,
    ListItemButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';

const mockCategories = [
    { id: 1, nom: 'Alimentation', couleur: '#4CAF50' },
    { id: 2, nom: 'Boissons', couleur: '#2196F3' },
    { id: 3, nom: 'Entretien', couleur: '#FF9800' },
];

export const Categories = () => {
    return (
        <Box sx={{ pb: 8 }}>
            <Typography variant="h2" sx={{ mb: 3 }}>Catégories</Typography>

            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                {mockCategories.map((cat) => (
                    <ListItem
                        key={cat.id}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 0 }}
                    >
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: cat.couleur }}>
                                    <CategoryIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="h4">{cat.nom}</Typography>}
                            />
                        </ListItemButton>
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

import { useState } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from '../utils/pdf';

// Mock data pour les rapports
const mockVentes = [
    { id: 1, reference: 'VT-0001', date: '2026-03-02', total: 4500, statut: 'complétée', type: 'comptant', client: 'Client Anonyme' },
    { id: 2, reference: 'VT-0002', date: '2026-03-01', total: 15000, statut: 'en attente', type: 'crédit', client: 'Boutique Maman' },
    { id: 3, reference: 'VT-0003', date: '2026-02-28', total: 800, statut: 'complétée', type: 'comptant', client: 'Client Anonyme' },
];

export const Rapports = () => {
    const [debut, setDebut] = useState('');
    const [fin, setFin] = useState('');
    const [type, setType] = useState('ventes');

    const downloadPDF = async () => {
        const blob = await pdf(<ReportDocument ventes={mockVentes} periode={`${debut} au ${fin}`} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_ventes_${debut}_${fin}.pdf`;
        link.click();
    };

    const downloadExcelLocal = () => {
        // Basique CSV au lieu de faire du vrai Excel lourd coté front MVP
        const headers = ["Référence", "Date", "Client", "Type", "Total"];
        const rows = mockVentes.map(v => [v.reference, v.date, v.client, v.type, v.total].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_ventes_${debut}_${fin}.csv`;
        link.click();
    };

    return (
        <Box sx={{ pb: 8 }}>
            <Typography variant="h2" sx={{ mb: 3 }}>Rapports et Exports</Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            select
                            fullWidth
                            label="Type de rapport"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <MenuItem value="ventes">Rapport des Ventes</MenuItem>
                            <MenuItem value="stock">Mouvements de Stock</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Date de début"
                            InputLabelProps={{ shrink: true }}
                            value={debut}
                            onChange={(e) => setDebut(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Date de fin"
                            InputLabelProps={{ shrink: true }}
                            value={fin}
                            onChange={(e) => setFin(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={downloadPDF}
                        disabled={!debut || !fin}
                    >
                        Exporter PDF
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DescriptionIcon />}
                        onClick={downloadExcelLocal}
                        disabled={!debut || !fin}
                    >
                        Exporter Excel (CSV)
                    </Button>
                </Box>
            </Paper>

            <Typography variant="h4" sx={{ mb: 2 }}>Aperçu :</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'surfaceVariant.main' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Référence</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockVentes.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.reference}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.client}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.total} FCFA</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

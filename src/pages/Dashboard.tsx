import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { dashboardAPI, ventesAPI } from '../utils/api';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from '../utils/pdf';

export const Dashboard = () => {
    const [periode, setPeriode] = useState<'7j' | '30j' | '3m' | 'tout'>('7j');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // Filter for reports (Default to last 7 days)
    const [reportDebut] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [reportFin] = useState(new Date().toISOString().split('T')[0]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await dashboardAPI.getStats(periode);
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [periode]);

    const formatFCFA = (val: number) => {
        return new Intl.NumberFormat('fr-FR').format(val);
    };

    const handleDownloadPDF = async () => {
        try {
            const res = await ventesAPI.list();
            const filteredVentes = res.data.filter((v: any) => {
                const d = v.created_at.split('T')[0];
                return d >= reportDebut && d <= reportFin;
            });

            const blob = await pdf(<ReportDocument ventes={filteredVentes} periode={`${reportDebut} au ${reportFin}`} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport_ventes_${reportDebut}_${reportFin}.pdf`;
            link.click();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const res = await ventesAPI.list();
            const filteredVentes = res.data.filter((v: any) => {
                const d = v.created_at.split('T')[0];
                return d >= reportDebut && d <= reportFin;
            });

            const headers = ["Référence", "Date", "Total"];
            const rows = filteredVentes.map((v: any) => [
                v.reference,
                v.created_at.split('T')[0],
                v.total
            ].join(','));
            const csvContent = [headers.join(','), ...rows].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport_ventes_${reportDebut}_${reportFin}.csv`;
            link.click();
        } catch (error) {
            console.error('Error generating CSV:', error);
        }
    };

    if (loading && !stats) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    const kpis = [
        { label: 'Chiffre d\'Affaires', value: formatFCFA(stats?.revenue || 0), unit: 'FCFA', color: '#2e7d32', icon: <TrendingUpIcon fontSize="small" /> },
        { label: 'Bénéfices', value: formatFCFA(stats?.profit || 0), unit: 'FCFA', color: '#0288d1', icon: <AccountBalanceWalletIcon fontSize="small" /> },
        { label: 'Transactions', value: stats?.transactions_count || 0, unit: 'ventes', color: '#6a1b9a', icon: <ReceiptLongIcon fontSize="small" /> },
        { label: 'Pleins en Stock', value: stats?.total_pleins || 0, unit: 'articles', color: '#0277bd', icon: <InventoryIcon fontSize="small" /> },
        ...(stats?.has_reusable_products ? [{ label: 'Vides en Stock', value: stats?.total_vides || 0, unit: 'articles', color: '#ef6c00', icon: <Inventory2Icon fontSize="small" /> }] : []),
        { label: 'Valeur du Stock', value: formatFCFA(stats?.stock_value || 0), unit: 'FCFA', color: '#E65100', icon: <AccountBalanceWalletIcon fontSize="small" /> },
        { label: 'Alertes Stock', value: stats?.stock_alerts_count || 0, unit: 'produits', color: '#c62828', icon: <WarningAmberIcon fontSize="small" /> },
    ];

    return (
        <Box sx={{ pb: 10 }}>
            {/* Header + Filtre */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h2">Tableau de bord</Typography>
                    <Typography variant="body2" color="text.secondary">Vue d'ensemble de votre activité</Typography>
                </Box>
                <ToggleButtonGroup
                    value={periode}
                    exclusive
                    onChange={(_, val) => { if (val) setPeriode(val); }}
                    size="small"
                >
                    <ToggleButton value="7j">7j</ToggleButton>
                    <ToggleButton value="30j">30j</ToggleButton>
                    <ToggleButton value="3m">3 mois</ToggleButton>
                    <ToggleButton value="tout">Tout</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(auto-fit, minmax(160px, 1fr))' }, gap: 2, mb: 4 }}>
                {kpis.map((kpi) => (
                    <Card key={kpi.label} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {kpi.label}
                                </Typography>
                                <Box sx={{ color: kpi.color, lineHeight: 0 }}>{kpi.icon}</Box>
                            </Box>
                            <Typography variant="h3" sx={{ color: kpi.color, fontWeight: 700, fontSize: '1.5rem' }}>
                                {kpi.value}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">{kpi.unit}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Rapport */}
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DescriptionIcon color="primary" fontSize="small" />
                                    <Typography variant="h6" fontWeight="bold">Telecharger les Rapports</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon />}
                                        onClick={handleDownloadPDF}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<DescriptionIcon />}
                                        onClick={handleDownloadCSV}
                                    >
                                        CSV
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Tableau Récapitulatif Quotidien */}
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h5" fontWeight="bold">Détails par jour</Typography>
                            <Chip label={`${periode}`} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Jour</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ventes</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Approv.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>C.A.</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bénéfice</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats?.daily_stats?.map((day: any) => (
                                    <TableRow key={day.date} hover>
                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                            {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={day.transactions_count || 0} size="small" sx={{ fontWeight: 'bold', height: 20, fontSize: '0.7rem' }} />
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'info.main' }}>
                                            {day.supply > 0 ? formatFCFA(day.supply) : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {day.revenue > 0 ? formatFCFA(day.revenue) : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                            {day.profit > 0 ? formatFCFA(day.profit) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!stats?.daily_stats || stats.daily_stats.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                            Aucune donnée enregistrée pour cette période
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    {/* Articles en alerte */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningAmberIcon fontSize="small" /> Alertes Stock ({stats?.alerts?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {stats?.alerts?.map((alert: any) => (
                                <Chip
                                    key={alert.nom}
                                    label={`${alert.nom} : ${alert.qte_actuelle} restants`}
                                    color={alert.qte_actuelle <= 0 ? "error" : "warning"}
                                    size="small"
                                    sx={{ justifyContent: 'flex-start', px: 1, py: 2, borderRadius: 2 }}
                                />
                            ))}
                            {stats?.alerts?.length === 0 && (
                                <Typography variant="body2" color="success.main">Tous les stocks sont corrects ✅</Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Top 3 Produits */}
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LeaderboardIcon fontSize="small" /> Top 3 Produits (Période)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {stats?.top_produits?.map((prod: any, idx: number) => (
                            <Card key={prod.nom} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: idx === 0 ? 'gold' : idx === 1 ? 'silver' : '#cd7f32' }} />
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{prod.nom}</Typography>
                                            <Typography variant="caption" color="text.secondary">{prod.total_qte} unités vendues</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            {formatFCFA(prod.total_revenu)} F
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {(!stats?.top_produits || stats.top_produits.length === 0) && (
                            <Typography variant="body2" color="text.disabled">Aucune vente sur cette période</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// --- Styling pour Ticket de Caisse (Thermique 80mm) ---
// Largeur 80mm = ~226 points
const receiptStyles = StyleSheet.create({
    page: {
        padding: 12,
        fontSize: 9,
        fontFamily: 'Helvetica',
        width: 226,
        color: '#1a1a1a'
    },
    header: {
        alignItems: 'center',
        marginBottom: 12
    },
    logo: {
        width: 40,
        height: 40,
        marginBottom: 4,
        borderRadius: 4
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'extrabold',
        color: '#d32f2f', // Brand red
        marginBottom: 2
    },
    subtitle: {
        fontSize: 8,
        color: '#666',
        marginBottom: 2
    },
    divider: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
        marginVertical: 6
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        fontSize: 8
    },
    label: {
        color: '#666'
    },
    value: {
        fontWeight: 'bold'
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        paddingBottom: 4,
        marginBottom: 4,
        fontSize: 7,
        fontWeight: 'bold',
        color: '#999',
        textTransform: 'uppercase'
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    itemName: {
        flex: 1,
        fontSize: 9,
        fontWeight: 'medium'
    },
    itemQty: {
        width: 30,
        textAlign: 'center'
    },
    itemPrice: {
        width: 60,
        textAlign: 'right',
        fontWeight: 'bold'
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
        fontSize: 9
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#000',
        fontWeight: 'bold',
        fontSize: 12
    },
    footer: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 7,
        color: '#999',
        lineHeight: 1.4
    }
});

export const ReceiptDocument = ({ vente }: { vente: any }) => (
    <Document>
        <Page style={receiptStyles.page}>
            <View style={receiptStyles.header}>
                <Image src="/logo.png" style={receiptStyles.logo} />
                <Text style={receiptStyles.shopName}>FORCE</Text>
                <Text style={receiptStyles.subtitle}>La force de gérer, la liberté de grandir.</Text>
                <Text style={receiptStyles.subtitle}>Douala, Cameroun | Tél: +237 600 000 000</Text>
            </View>

            <View style={receiptStyles.divider} />

            <View style={{ marginBottom: 4 }}>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Facture N° :</Text>
                    <Text style={receiptStyles.value}>{vente.reference}</Text>
                </View>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Date :</Text>
                    <Text style={receiptStyles.value}>{new Date(vente.created_at).toLocaleString('fr-FR')}</Text>
                </View>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Caissier :</Text>
                    <Text style={receiptStyles.value}>{vente.user?.nom || 'Admin'}</Text>
                </View>
                {vente.credit && (
                    <View style={receiptStyles.infoRow}>
                        <Text style={receiptStyles.label}>Client :</Text>
                        <Text style={receiptStyles.value}>{vente.credit.client_nom}</Text>
                    </View>
                )}
            </View>

            <View style={receiptStyles.divider} />

            <View style={receiptStyles.tableHeader}>
                <Text style={receiptStyles.itemName}>Désignation</Text>
                <Text style={receiptStyles.itemQty}>Qté</Text>
                <Text style={receiptStyles.itemPrice}>Total</Text>
            </View>

            {vente.lignes?.map((ligne: any, idx: number) => (
                <View style={receiptStyles.itemRow} key={idx}>
                    <Text style={receiptStyles.itemName}>{ligne.article?.nom || 'Article inconnu'}</Text>
                    <Text style={receiptStyles.itemQty}>{ligne.quantite}</Text>
                    <Text style={receiptStyles.itemPrice}>{(ligne.quantite * ligne.prix_unitaire).toLocaleString()} F</Text>
                </View>
            ))}

            <View style={receiptStyles.divider} />

            <View style={receiptStyles.summaryRow}>
                <Text>Sous-total</Text>
                <Text>{(vente.total - (vente.frais_livraison || 0)).toLocaleString()} F</Text>
            </View>

            {vente.frais_livraison > 0 && (
                <View style={receiptStyles.summaryRow}>
                    <Text>Livraison</Text>
                    <Text>{vente.frais_livraison.toLocaleString()} F</Text>
                </View>
            )}

            <View style={receiptStyles.totalRow}>
                <Text>NET À PAYER</Text>
                <Text>{vente.total.toLocaleString()} FCFA</Text>
            </View>

            <View style={{ marginTop: 8, fontSize: 8 }}>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Mode de paiement :</Text>
                    <Text style={receiptStyles.value}>{vente.type === 'comptant' ? 'Espèces' : 'Crédit'}</Text>
                </View>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Montant reçu :</Text>
                    <Text style={receiptStyles.value}>{vente.montant_recu.toLocaleString()} F</Text>
                </View>
                <View style={receiptStyles.infoRow}>
                    <Text style={receiptStyles.label}>Monnaie rendue :</Text>
                    <Text style={receiptStyles.value}>{vente.monnaie_rendue.toLocaleString()} F</Text>
                </View>
            </View>

            <View style={receiptStyles.footer}>
                <Text>Merci de votre confiance !</Text>
                <Text>Les marchandises vendues ne sont ni reprises ni échangées.</Text>
                <Text>Logiciel de gestion FORCE v1.0</Text>
            </View>
        </Page>
    </Document>
);

// --- Styling pour Rapport A4 ---
const reportStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 11, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 20, fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: '#666', marginTop: 5 },
    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f0f0f0', padding: 5, fontWeight: 'bold' },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
    tableCellHeader: { margin: 'auto', fontSize: 10, fontWeight: 'bold' },
    tableCell: { margin: 'auto', fontSize: 10 }
});

export const ReportDocument = ({ ventes, periode }: { ventes: any[], periode: string }) => (
    <Document>
        <Page size="A4" style={reportStyles.page}>
            <View style={reportStyles.header}>
                <Text style={reportStyles.title}>Rapport des Ventes</Text>
                <Text style={reportStyles.subtitle}>Période : {periode}</Text>
            </View>

            <View style={reportStyles.table}>
                <View style={reportStyles.tableRow}>
                    <View style={reportStyles.tableColHeader}><Text style={reportStyles.tableCellHeader}>Date</Text></View>
                    <View style={reportStyles.tableColHeader}><Text style={reportStyles.tableCellHeader}>Référence</Text></View>
                    <View style={reportStyles.tableColHeader}><Text style={reportStyles.tableCellHeader}>Client</Text></View>
                    <View style={reportStyles.tableColHeader}><Text style={reportStyles.tableCellHeader}>Total (FCFA)</Text></View>
                </View>
                {ventes.map((vente, i) => (
                    <View style={reportStyles.tableRow} key={i}>
                        <View style={reportStyles.tableCol}><Text style={reportStyles.tableCell}>{vente.date}</Text></View>
                        <View style={reportStyles.tableCol}><Text style={reportStyles.tableCell}>{vente.reference}</Text></View>
                        <View style={reportStyles.tableCol}><Text style={reportStyles.tableCell}>{vente.client}</Text></View>
                        <View style={reportStyles.tableCol}><Text style={reportStyles.tableCell}>{vente.total}</Text></View>
                    </View>
                ))}
            </View>

            <View style={{ marginTop: 20, textAlign: 'right', fontWeight: 'bold', fontSize: 14 }}>
                <Text>Total Période : {ventes.reduce((sum, v) => sum + v.total, 0)} FCFA</Text>
            </View>
        </Page>
    </Document>
);

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- Styling pour Ticket de Caisse (Thermique 80mm) ---
// Largeur 80mm = ~226 points
const receiptStyles = StyleSheet.create({
    page: { padding: 10, fontSize: 10, fontFamily: 'Helvetica', width: 226 },
    header: { textAlign: 'center', marginBottom: 10 },
    title: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    subtitle: { fontSize: 9, color: '#333' },
    divider: { borderBottomWidth: 1, borderBottomColor: '#000', borderBottomStyle: 'dashed', marginVertical: 5 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    itemName: { width: '60%' },
    itemPrice: { width: '40%', textAlign: 'right' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, fontWeight: 'bold', fontSize: 12 },
    footer: { marginTop: 15, textAlign: 'center', fontSize: 8 }
});

export const ReceiptDocument = ({ vente }: { vente: any }) => (
    <Document>
        <Page style={receiptStyles.page}>
            <View style={receiptStyles.header}>
                <Text style={receiptStyles.title}>FORCE</Text>
                <Text style={receiptStyles.subtitle}>Votre Partenaire Business</Text>
                <Text style={receiptStyles.subtitle}>Tél: +237 600 000 000</Text>
            </View>

            <View style={receiptStyles.divider} />

            <View style={{ marginBottom: 5 }}>
                <Text>Réf: {vente.reference}</Text>
                <Text>Date: {vente.date}</Text>
                <Text>Client: {vente.client}</Text>
            </View>

            <View style={receiptStyles.divider} />

            {/* Simulating sale items for the receipt MVP */}
            <View style={receiptStyles.itemRow}>
                <Text style={receiptStyles.itemName}>1x Article A</Text>
                <Text style={receiptStyles.itemPrice}>5 000 F</Text>
            </View>
            <View style={receiptStyles.itemRow}>
                <Text style={receiptStyles.itemName}>2x Article B</Text>
                <Text style={receiptStyles.itemPrice}>10 000 F</Text>
            </View>

            <View style={receiptStyles.divider} />

            <View style={receiptStyles.totalRow}>
                <Text>TOTAL</Text>
                <Text>{vente.total} FCFA</Text>
            </View>

            <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', fontSize: 9 }}>
                <Text>Mode:</Text>
                <Text>{vente.type}</Text>
            </View>

            <View style={receiptStyles.footer}>
                <Text>Merci de votre visite !</Text>
                <Text>Propulsé par FORCE</Text>
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

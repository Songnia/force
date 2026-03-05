import Dexie, { type EntityTable } from 'dexie';

export interface Article {
    id?: number;
    categorie_id: number;
    nom: string;
    reference: string;
    unite: string;
    prix_achat: number;
    prix_vente: number;
    qte_actuelle: number;
    seuil_alerte: number;
    photo_url?: string;
    statut: 'actif' | 'archivé';
    synced?: number; // 1 if synced with server, 0 if local only
}

export interface Categorie {
    id?: number;
    nom: string;
    couleur: string;
    user_id: number;
}

export interface Vente {
    id?: number;
    reference: string;
    user_id: number;
    client_id?: number | null;
    type: 'comptant' | 'crédit';
    total: number;
    montant_recu: number;
    monnaie_rendue: number;
    statut: string;
    created_at: string;
    synced?: number;
}

export interface VenteLigne {
    id?: number;
    vente_id: number | string; // Handle offline string IDs
    article_id: number;
    quantite: number;
    prix_unitaire: number;
    prix_achat_moment: number;
    benefice_unitaire: number;
}

export interface SyncOperation {
    id?: number;
    entity: string; // 'article', 'vente', etc.
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    created_at: string;
}

const db = new Dexie('ForceDatabase') as Dexie & {
    articles: EntityTable<Article, 'id'>;
    categories: EntityTable<Categorie, 'id'>;
    ventes: EntityTable<Vente, 'id'>;
    vente_lignes: EntityTable<VenteLigne, 'id'>;
    sync_queue: EntityTable<SyncOperation, 'id'>;
};

// Schema definition
db.version(1).stores({
    articles: '++id, categorie_id, reference, nom, statut',
    categories: '++id, nom, user_id',
    ventes: '++id, reference, user_id, type, statut, created_at',
    vente_lignes: '++id, vente_id, article_id',
    sync_queue: '++id, entity, operation, created_at',
});

export { db };

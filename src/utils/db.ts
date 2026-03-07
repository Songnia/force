import Dexie, { type EntityTable } from 'dexie';

/**
 * Interface for articles cached locally for offline display in POS.
 */
export interface ArticleCache {
    id: number;
    nom: string;
    reference: string;
    unite: string;
    prix_vente: number;
    cout_livraison: number;
    qte_actuelle: number;
    qte_vide: number;
    seuil_alerte: number;
    statut: string;
    photo_url?: string;
    categorie?: { nom: string };
    total_vendu?: number;
    vendu_aujourdhui?: number;
    revenue?: number;
    profit?: number;
}

/**
 * Interface for operations queued while offline.
 */
export interface SyncQueueItem {
    id?: number; // auto-incremented by Dexie
    type: 'vente'; // currently only ventes are queued offline
    payload: {
        reference: string;
        type: string;
        total: number;
        montant_recu: number;
        monnaie_rendue: number;
        avec_livraison: boolean;
        frais_livraison: number;
        lignes: { article_id: number; quantite: number; prix_unitaire: number }[];
    };
    createdAt: string; // ISO timestamp
    synced: boolean;
}

class ForceDB extends Dexie {
    articles!: EntityTable<ArticleCache, 'id'>;
    syncQueue!: EntityTable<SyncQueueItem, 'id'>;

    constructor() {
        super('ForceDB');
        this.version(1).stores({
            articles: 'id, nom, statut',
            syncQueue: '++id, type, synced, createdAt',
        });
    }
}

export const db = new ForceDB();

/**
 * Saves articles to the local cache.
 */
export async function cacheArticles(articles: ArticleCache[]) {
    await db.articles.clear();
    await db.articles.bulkPut(articles);
}

/**
 * Retrieves cached articles for offline display.
 */
export async function getCachedArticles(): Promise<ArticleCache[]> {
    return db.articles.toArray();
}

/**
 * Adds an offline operation to the sync queue.
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'synced' | 'createdAt'>) {
    await db.syncQueue.add({
        ...item,
        createdAt: new Date().toISOString(),
        synced: false,
    });
}

/**
 * Returns all pending (unsynced) items in the queue.
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('synced').equals(0).toArray();
}

/**
 * Marks a sync queue item as synced.
 */
export async function markSynced(id: number) {
    await db.syncQueue.update(id, { synced: true });
}

// Per-product asset gallery stored in the browser via IndexedDB. Chosen over
// localStorage (which capped uploads at ~5MB and broke) and over the server FS
// (Vercel's runtime filesystem is read-only). Uploads are scoped per product
// (water / solar / anker / roofing) so each carousel has its own photo library.
// "hidden" lets the user remove bundled/brand images from a product's gallery
// without touching the read-only files on disk.

const DB_NAME = "wm_studio_assets";
// v3: bumped so browsers that reached v2 *before* the `docs` store was added run
// onupgradeneeded again and create it. Without this they hit "object store not
// found" on save. The `if (!contains)` guards below make the upgrade idempotent.
const DB_VERSION = 3;
const UPLOADS = "uploads";
const HIDDEN = "hidden";
// Each product's full carousel document (copy + inline image data URLs) lives
// here, keyed by its storage key. Moved off localStorage, whose ~5MB quota
// filled up once a few base64 photos were embedded in the doc.
const DOCS = "docs";

export interface UploadRecord {
  id: number;
  product: string;
  name: string;
  src: string; // data URL
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible en este navegador"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(UPLOADS)) {
        const s = db.createObjectStore(UPLOADS, { keyPath: "id", autoIncrement: true });
        s.createIndex("product", "product", { unique: false });
      }
      if (!db.objectStoreNames.contains(HIDDEN)) {
        db.createObjectStore(HIDDEN, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(DOCS)) {
        db.createObjectStore(DOCS, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir la base de datos"));
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export async function addUpload(product: string, name: string, src: string): Promise<void> {
  await tx<IDBValidKey>(UPLOADS, "readwrite", (s) =>
    s.add({ product, name, src, createdAt: Date.now() })
  );
}

export async function listUploads(product: string): Promise<UploadRecord[]> {
  const all = await tx<UploadRecord[]>(UPLOADS, "readonly", (s) =>
    s.index("product").getAll(product)
  );
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteUpload(id: number): Promise<void> {
  await tx<undefined>(UPLOADS, "readwrite", (s) => s.delete(id));
}

const hiddenKey = (product: string, src: string) => `${product}::${src}`;

export async function hideAsset(product: string, src: string): Promise<void> {
  await tx<IDBValidKey>(HIDDEN, "readwrite", (s) => s.put({ key: hiddenKey(product, src), product, src }));
}

export async function listHidden(product: string): Promise<string[]> {
  const all = await tx<{ key: string; product: string; src: string }[]>(HIDDEN, "readonly", (s) => s.getAll());
  return all.filter((h) => h.product === product).map((h) => h.src);
}

// ── Carousel document persistence (replaces the old localStorage autosave) ──

export async function saveDoc<T>(key: string, doc: T): Promise<void> {
  await tx<IDBValidKey>(DOCS, "readwrite", (s) => s.put({ key, doc, updatedAt: Date.now() }));
}

export async function loadDoc<T>(key: string): Promise<T | null> {
  const rec = await tx<{ key: string; doc: T } | undefined>(DOCS, "readonly", (s) => s.get(key));
  return rec ? rec.doc : null;
}

export async function deleteDoc(key: string): Promise<void> {
  await tx<undefined>(DOCS, "readwrite", (s) => s.delete(key));
}

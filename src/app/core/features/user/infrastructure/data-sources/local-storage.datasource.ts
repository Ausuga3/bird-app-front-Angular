 export class LocalStorageDataSource<T> {
    constructor(private readonly key:string){}

    isAvailable(): boolean {
        try {
            return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    getAll(): T[]{
        if (!this.isAvailable()) return [];
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    saveAll(items: T[]): void{
        if (!this.isAvailable()) return;
        localStorage.setItem(this.key, JSON.stringify(items));
    }
    
    clear(): void {
        if (!this.isAvailable()) return;
        localStorage.removeItem(this.key);
    }
 }
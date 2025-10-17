 export class LocalStorageDataSource<T> {
    constructor(private readonly key:string){}

    getAll(): T[]{
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    saveAll(items: T[]): void{
        localStorage.setItem(this.key, JSON.stringify(items));
    }
 }
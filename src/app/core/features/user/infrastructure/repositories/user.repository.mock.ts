import { Injectable } from "@angular/core";
import { LocalStorageDataSource } from "../data-sources/local-storage.datasource";
import { User } from "../../domain/entities/user.interface";
import { UserRepository } from "../../domain/repositories/user.repository";

@Injectable({providedIn: 'root'})
export class UserRepositoryMock implements UserRepository {
    private readonly dataSource = new LocalStorageDataSource<User>('users_mock');

    async register(user: User): Promise<User>{
        const users = this.dataSource.getAll() || [];
        users.push(user);
        this.dataSource.saveAll(users);
        return user;
    }

    async login(email: string, password: string): Promise<User | null> {
        const users = this.dataSource.getAll() || [];
        const user = users.find(u => u.email === email);
        return user ?? null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const users = this.dataSource.getAll() || [];
        return users.find(u => u.email === email) ?? null;
        
    }
}

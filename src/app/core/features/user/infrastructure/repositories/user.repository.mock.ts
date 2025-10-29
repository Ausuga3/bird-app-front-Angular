import { RolEnum } from './../../domain/entities/rol.interface';
import { Injectable } from "@angular/core";
import { LocalStorageDataSource } from "../data-sources/local-storage.datasource";
import { User } from "../../domain/entities/user.interface";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserDomainService } from "../../domain/services/user.domain-service";

@Injectable({providedIn: 'root'})
export class UserRepositoryMock implements UserRepository {
    private readonly dataSource = new LocalStorageDataSource<User>('users_mock');

    constructor() {
         if (!this.dataSource.isAvailable()) return;
      
        const users = this.dataSource.getAll() || [];
    if (!users || users.length === 0) {
        const admin: User = {
            id: crypto.randomUUID(),
            name: 'Admin',
            email: 'admin@example.com',
            hashedPassword: UserDomainService.hashPassword('admin123'),
            date: new Date(),
            rol: {
                id: crypto.randomUUID(),
                name: RolEnum.ADMIN,
                description: 'Administrador'
            },
            isActive: true
        };
        users.push(admin);
        this.dataSource.saveAll(users);
    }
}
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

    async getUserById(id: string): Promise<User | null> {
        const users = this.dataSource.getAll() || [];
        return users.find(u => u.id === id) ?? null;
    }

    async updateUser(user: User): Promise<User> {
        const users = this.dataSource.getAll() || [];
        const idx = users.findIndex(u => u.id === user.id);
        if (idx === -1) throw new Error('Usuario no encontrado');
        users[idx] = user;
        this.dataSource.saveAll(users);
        return user;
    }

    async getUsers(user: User): Promise<User[]> {
        const users = this.dataSource.getAll() || [];
        return users;
    }

}

import { User } from "../entities/user.interface";

export class UserDomainService {
    static hashPassword(password: string): string {
        return btoa(password); // Simple base64 encoding for demonstration
    }

    static verifyPassword(hashedPassword: string, password: string): boolean {
        return btoa(password) === hashedPassword;
    }

    static activateUser(user: User): User {
        if (!user || typeof user !== 'object') {
            throw new Error('Invalid user object');
        }
        return { ...user, isActive: true };
    }
}
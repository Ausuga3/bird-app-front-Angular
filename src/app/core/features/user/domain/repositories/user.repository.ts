
import { User } from '../entities/user.interface';

export abstract class UserRepository {
 
  abstract register(user:User): Promise<User>;
  // Returns an object with user and optional token returned by backend
  abstract login(email:string, password:string): Promise<{ user: User | null; token?: string }>;
  abstract getUserByEmail(email:string): Promise<User | null>;
  abstract getUserById(id:string): Promise<User | null>;
  abstract updateUser(userId:string, patch: Partial<User>): Promise<User>;
  abstract getUsers(users:User): Promise<User[]>;
}

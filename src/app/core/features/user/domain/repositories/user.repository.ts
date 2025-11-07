
import { User } from '../entities/user.interface';

export abstract class UserRepository {
 
  abstract register(user:User): Promise<User>;
  abstract login(email:string, password:string): Promise<User | null>;
  abstract getUserByEmail(email:string): Promise<User | null>;
  abstract getUserById(id:string): Promise<User | null>;
  abstract updateUser(userId:string, patch: Partial<User>): Promise<User>;
  abstract getUsers(users:User): Promise<User[]>;
}

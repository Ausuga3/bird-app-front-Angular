import { Rol } from "./rol.interface";

export interface User {
    id:string,
    name: string,
    email: string,
    isActive: boolean,
    hashedPassword?: string,
    date: Date,
    rol : Rol
}
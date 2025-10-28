import { RolEnum } from "../../domain/entities/rol.interface";

export interface RegisterUserDto{
    name: string;
    email: string;
    password: string;
    rolName?: RolEnum;
}

export interface LoginUserDto{
    email: string;
    password: string;
}

export interface ChangeRoleDto{
    actorId: string; // admin
    targetUserId: string; //usuario al que le vamos a cambiar el rol
    newRol: RolEnum;
}
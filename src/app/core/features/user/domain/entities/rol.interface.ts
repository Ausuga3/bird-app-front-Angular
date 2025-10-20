export interface Rol {
    id: string;
    name: RolEnum,
    description: string,
}

export enum RolEnum{
    ADMIN = 'admin',
    USER = 'user',
    EXPERT = 'expert'
}
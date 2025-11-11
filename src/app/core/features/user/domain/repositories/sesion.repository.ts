import { Session } from "../entities/sesion.interface";


export abstract class SessionRepository {
  abstract getActive(): Promise<Session | null>;
  abstract start(userId: string, token?: string): Promise<void>;
  abstract end(): Promise<void>;
}
import { Injectable } from '@angular/core';
import { Bird } from '../../domain/entities/bird.interface';
import { BirdRepository } from '../../domain/repositories/bird.repository';


const STORAGE_KEY = 'birds_store_v1';

@Injectable()
export class BirdLocalRepository implements BirdRepository {
  private readAll(): Bird[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Bird[] : [];
    } catch {
      return [];
    }
  }

  private writeAll(items: Bird[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async addBird(bird: Bird): Promise<Bird> {
    const items = this.readAll();
    const id = crypto?.randomUUID?.() ?? Date.now().toString();
    const now = new Date();
    const saved: Bird = { ...bird, id, created_at: now, updated_at: now };
    items.push(saved);
    this.writeAll(items);
    return saved;
  }

  async getAllBirds(): Promise<Bird[]> {
    return this.readAll();
  }

  async getBirdById(id: string): Promise<Bird | null> {
    return this.readAll().find(b => b.id === id) ?? null;
  }

  async editBird(id: string, patch: Partial<Bird>): Promise<Bird> {
    const items = this.readAll();
    const idx = items.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bird not found');
    const updated: Bird = { ...items[idx], ...patch, updated_at: new Date() };
    items[idx] = updated;
    this.writeAll(items);
    return updated;
  }

  async deleteBird(id: string): Promise<void> {
    const items = this.readAll().filter(b => b.id !== id);
    this.writeAll(items);
  }
}
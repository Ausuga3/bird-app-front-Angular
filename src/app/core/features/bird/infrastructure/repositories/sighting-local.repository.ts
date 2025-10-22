import { Injectable } from '@angular/core';
import { Sighting } from '../../domain/entities/sighting.interface';
import { SightingRepository } from '../../domain/repositories/sighiting.repository';


const STORAGE_KEY = 'sightings_store_v1';

@Injectable()
export class SightingLocalRepository implements SightingRepository {
 
  private readAll(): Sighting[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Sighting[] : [];
    } catch {
      return [];
    }
  }

  private writeAll(items: Sighting[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async addSighting(sighting: Omit<Sighting, 'id' | 'created_at' | 'updated_at'>): Promise<Sighting> {
    const items = this.readAll();
    const id = crypto?.randomUUID?.() ?? Date.now().toString();
    const now = new Date();
    const saved: Sighting = { ...sighting, id, created_at: now, updated_at: now };
    items.push(saved);
    this.writeAll(items);
    return saved;
  }

  async getAllSightings(): Promise<Sighting[]> {
    return this.readAll();
  }

  async getSightingByBirdId(birdId: string): Promise<Sighting[]> {
    return this.readAll().filter(s => s.id === birdId);
  }

  async getSightingById(id: string): Promise<Sighting | null> {
    return this.readAll().find(s => s.id === id) ?? null;
  }

  async deleteSighting(id: string): Promise<void> {
    const items = this.readAll().filter(s => s.id !== id);
    this.writeAll(items);
  }
}
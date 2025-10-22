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

  async addSighting(sighting: Sighting): Promise<Sighting> {
    const items = this.readAll();
    const id = crypto?.randomUUID?.() ?? Date.now().toString();
    const saved: Sighting = { ...sighting, id };
    items.push(saved);
    this.writeAll(items);
    return saved;
  }

  async getAllSightings(): Promise<Sighting[]> {
    return this.readAll();
  }

  async getSightingById(id: string): Promise<Sighting | null> {
    return this.readAll().find(s => s.id === id) ?? null;
  }

  async deleteSighting(id: string): Promise<void> {
    const items = this.readAll().filter(s => s.id !== id);
    this.writeAll(items);
  }
}
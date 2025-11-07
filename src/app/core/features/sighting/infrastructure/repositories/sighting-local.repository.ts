import { Injectable } from '@angular/core';
import { Sighting } from '../../domain/entities/sighting.interface';
import { SightingRepository } from '../../domain/repositories/sighting.repository';

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
    // Ensure we keep created_by if provided (could be undefined)
    const saved: Sighting = { ...sighting, id, created_at: now, updated_at: now };
    items.push(saved);
    this.writeAll(items);
    return saved;
  }

  async getAllSightings(): Promise<Sighting[]> {
    return this.readAll();
  }

  async getSightingByBirdId(birdId: string): Promise<Sighting[]> {
    return this.readAll().filter(s => s.bird.id === birdId);
  }

  async getSightingById(id: string): Promise<Sighting | null> {
    return this.readAll().find(s => s.id === id) ?? null;
  }

  async deleteSighting(id: string): Promise<void> {
    const items = this.readAll().filter(s => s.id !== id);
    this.writeAll(items);
  }

  // Implementación requerida por la interfaz: editar parcialmente un avistamiento
  async editSighting(id: string, patch: Partial<Sighting>): Promise<Sighting> {
    const items = this.readAll();
    const index = items.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Avistamiento no encontrado');
    }
    const existing = items[index];
    const merged: Sighting = {
      ...existing,
      ...(patch as Partial<Sighting>),
      updated_at: new Date(),
    } as Sighting;
    items[index] = merged;
    this.writeAll(items);
    return merged;
  }

  async viewSighting(id: string): Promise<Sighting | null> {
    return this.getSightingById(id);
  }
}
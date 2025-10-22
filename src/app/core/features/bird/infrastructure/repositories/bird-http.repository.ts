import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bird } from '../../domain/entities/bird.interface';
import { BirdRepository } from '../../domain/repositories/bird.repository';

// @Injectable()
// export class BirdHttpRepository implements BirdRepository {
//     private base = '/api/birds';
//     private http = inject(HttpClient);

//   override addBird(bird: Bird): Promise<Bird> {
//       throw new Error('Method not implemented.');
//}
//   override getAllBirds(): Promise<Bird[]> {
//       throw new Error('Method not implemented.');
//   }
//   override getBirdById(id: string): Promise<Bird | null> {
//       throw new Error('Method not implemented.');
//   }
//   override editBird(id: string, patch: Partial<Bird>): Promise<Bird> {
//       throw new Error('Method not implemented.');
//   }
//   override deleteBird(id: string): Promise<void> {
//       throw new Error('Method not implemented.');
//   }



// }
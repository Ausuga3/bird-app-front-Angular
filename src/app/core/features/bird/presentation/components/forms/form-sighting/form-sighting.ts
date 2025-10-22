import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BirdRepository } from '../../../../domain/repositories/bird.repository';
import { FormErrorsService } from '../../../../../../shared/forms/form-errors.service';
import { AddSightingUseCase } from '../../../../aplication/use-cases/add-sighting.use-case';
import { CommonModule } from '@angular/common';
import { Bird } from '../../../../domain/entities/bird.interface';
import type { Map, Marker, LeafletMouseEvent } from 'leaflet';
import { Subscription } from 'rxjs';


let L: typeof import('leaflet') | null = null;

@Component({
  selector: 'app-form-sighting',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-sighting.html',
  styleUrls: ['./form-sighting.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSighting implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private birdRepo: BirdRepository = inject(BirdRepository);
  private addSighting: AddSightingUseCase = inject(AddSightingUseCase);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  // expose form errors utility for template usage
  formErrors = inject(FormErrorsService);
  
  private messageTimeout?: number;

  form: FormGroup = this.fb.group({
    latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
    country: ['', Validators.required],
    birdId: [null, Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    notes: ['']
  });

  successMessage: string | null = null;
  errorMessage: string | null = null;
  private valueChangesSub?: Subscription;


  map?: Map;
  marker?: Marker;
  birds: Bird[] = [];
  isSubmitting = false;

  async loadBirds(): Promise<void> {
    this.birds = await this.birdRepo.getAllBirds();
  }

  async ngOnInit(): Promise<void> {
    await this.loadBirds();

    this.valueChangesSub = this.form.valueChanges.subscribe(() => {
      this.successMessage = null;
      this.errorMessage = null;
    });

    if (isPlatformBrowser(this.platformId)) {
      // Cargamos Leaflet solo en el navegador
      const leaflet = await import('leaflet');
      L = leaflet.default;
      setTimeout(() => this.initMap(), 0);
    }
  }

  initMap(): void {
    if (!isPlatformBrowser(this.platformId) || !L) return;
    
    this.map = L.map('sigthing-map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    
    this.map?.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      this.form.patchValue({ latitude: lat, longitude: lng });
    });
  }

  setMarker(lat: number, lng: number): void {
    if (!isPlatformBrowser(this.platformId) || !this.map || !L) return;
    
    if (this.marker) {
      this.marker.remove();
    }
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.setView([lat, lng], 12);
  }

  useMyLocation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Geolocation is not available in SSR');
      return;
    }
    
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.setMarker(lat, lng);
        this.form.patchValue({ latitude: lat, longitude: lng });
      },
      (err) => alert('No se pudo obtener la geolocalización: ' + err.message)
    );
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // clear any previous server validation errors
    this.formErrors.clearServerErrors(this.form);
    
    this.isSubmitting = true;
    this.cdr.markForCheck();
    try {
      console.log('Ejecutando addSighting.execute()');
      await this.addSighting.execute({
        coordinates: {
          latitude: this.form.value.latitude,
          longitude: this.form.value.longitude
        },
        country: this.form.value.country,
        birdId: this.form.value.birdId,
        date: this.form.value.date,
        notes: this.form.value.notes
      });

      console.log('Avistamiento guardado correctamente, asignando successMessage');
      // Forzar un pequeño retraso para asegurar que la UI se actualiza
      setTimeout(() => {
        this.successMessage = 'Avistamiento guardado correctamente.';
        this.errorMessage = null;
        console.log('Estado actual - successMessage:', this.successMessage);
        this.cdr.detectChanges(); // Usar detectChanges en lugar de markForCheck para forzar actualización
        
        // Auto-limpieza de mensajes después de 20 segundos
        window.clearTimeout(this.messageTimeout);
        this.messageTimeout = window.setTimeout(() => {
          this.successMessage = null;
          this.errorMessage = null;
          this.cdr.detectChanges();
          console.log('Mensajes limpiados automáticamente');
        }, 20000);
      }, 100);
      
      this.form.reset({
        latitude: null,
        longitude: null,
        country: '',
        birdId: null,
        date: new Date().toISOString().substring(0, 10),
        notes: ''
      });

      
      if (this.marker) {
        this.marker.remove();
        this.marker = undefined;
      }
      if (this.map) {
        this.map.setView([0, 0], 2);
      }

    } catch (err: any) {
      // map server validation errors (expected shape: { field: 'msg' } or { field: ['msg1','msg2'] })
      const payload = err?.errors ?? err;
      this.formErrors.mapServerErrorsToForm(this.form, payload);
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.errorMessage = err?.message || 'Error al guardar el avistamiento.';
        this.successMessage = null;
        this.cdr.detectChanges();
        
        // Auto-limpieza de mensajes después de 20 segundos para error también
        window.clearTimeout(this.messageTimeout);
        this.messageTimeout = window.setTimeout(() => {
          this.successMessage = null;
          this.errorMessage = null;
          this.cdr.detectChanges();
          console.log('Mensajes de error limpiados automáticamente');
        }, 20000);
      }, 100);
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.map) {
      this.map.remove();
    }
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
    if (this.messageTimeout) {
      window.clearTimeout(this.messageTimeout);
    }
  }

  


  
 }

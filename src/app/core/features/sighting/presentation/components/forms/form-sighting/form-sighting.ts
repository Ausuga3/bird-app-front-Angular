import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BirdRepository } from '../../../../../bird/domain/repositories/bird.repository';
import { FormErrorsService } from '../../../../../../shared/forms/form-errors.service';
import { AuthStateService } from '../../../../../../shared/services/auth-state.service';
import { AddSightingUseCase } from '../../../../aplication/use-cases/add-sighting.use-case';
import { CommonModule } from '@angular/common';
import { Bird } from '../../../../../bird/domain/entities/bird.interface';
import type { Map, Marker } from 'leaflet';
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
  formErrors = inject(FormErrorsService);
  private authState = inject(AuthStateService);
  
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

    const isBrowser = isPlatformBrowser(this.platformId);
    const loggedIn = isBrowser ? this.authState.isAuthenticated() : false;
    if (!loggedIn) {
      this.errorMessage = 'Tienes que iniciar sesión para registrar un avistamiento.';
      this.successMessage = null;
      this.cdr.detectChanges();
      return;
    }

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
      
      // Mensaje de éxito: asignar inmediatamente y forzar detección.
      this.successMessage = 'Avistamiento guardado correctamente.';
      this.errorMessage = null;
      console.log('Estado actual - successMessage:', this.successMessage);
      this.cdr.detectChanges();

      // Reiniciar temporizador de limpieza
      window.clearTimeout(this.messageTimeout);
      this.messageTimeout = window.setTimeout(() => {
        this.successMessage = null;
        this.errorMessage = null;
        this.cdr.detectChanges();
        console.log('Mensajes limpiados automáticamente');
      }, 20000);

      // Resetear el formulario sin emitir eventos para que la suscripción a
      // valueChanges no borre el mensaje de éxito inmediatamente.
      this.form.reset({
        latitude: null,
        longitude: null,
        country: '',
        birdId: null,
        date: new Date().toISOString().substring(0, 10),
        notes: ''
      }, { emitEvent: false });
      
      if (this.marker) {
        this.marker.remove();
        this.marker = undefined;
      }
      if (this.map) {
        this.map.setView([0, 0], 2);
      }

    } catch (err: any) {
      const payload = err?.errors ?? err;
      this.formErrors.mapServerErrorsToForm(this.form, payload);
      this.cdr.detectChanges();
      
      // Mostrar mensaje de error inmediatamente
      this.errorMessage = err?.message || 'Error al guardar el avistamiento.';
      this.successMessage = null;
      this.cdr.detectChanges();

      window.clearTimeout(this.messageTimeout);
      this.messageTimeout = window.setTimeout(() => {
        this.successMessage = null;
        this.errorMessage = null;
        this.cdr.detectChanges();
        console.log('Mensajes de error limpiados automáticamente');
      }, 20000);
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
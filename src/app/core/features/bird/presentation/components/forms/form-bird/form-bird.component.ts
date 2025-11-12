import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BirdRepository } from '../../../../domain/repositories/bird.repository';
import { AddBirdUseCase } from '../../../../aplication/use-cases/add-bird.use-case';
import { UpdateBirdUseCase } from '../../../../aplication/use-cases/update-bird.use-case';
import { Bird, BirdFamily, ConservationStatusEnum } from '../../../../domain/entities/bird.interface';
import { BirdLocalRepository } from '../../../../infrastructure/repositories/bird-local.repository';
import { FormErrorsService } from '../../../../../../shared/forms/form-errors.service';

@Component({
  selector: 'app-form-bird',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-bird.component.html',
  styleUrls: ['./form-bird.component.css'],
  // Eliminamos providers para usar los globales (BirdHttpRepository)
})
export class FormBirdComponent implements OnInit {
  birdForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Inputs/Outputs para reutilización del formulario fuera de rutas
  @Input() birdId: string | null = null;
  @Input() bird: Bird | null = null; 
  @Output() saved = new EventEmitter<Bird>();
  @Output() canceled = new EventEmitter<void>();
  isEditMode = false;
  pageTitle = 'Registrar nueva ave';
  
  // Exponer enums para usarlos en la plantilla
  readonly birdFamilies = Object.values(BirdFamily);
  readonly conservationStatuses = Object.values(ConservationStatusEnum);
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private birdRepository: BirdRepository,
    private addBirdUseCase: AddBirdUseCase,
    private updateBirdUseCase: UpdateBirdUseCase
  ) {
    // Inicializar formulario vacío para evitar errores en el template
    this.initForm();
  }


  formErrors = inject(FormErrorsService);
  
  ngOnInit(): void {
    // Si el padre pasó una entidad o un id, priorizarlos sobre la ruta.
    const routeId = this.route.snapshot.paramMap.get('id');
    // Prioridad: input `bird` > input `birdId` > route param
    if (this.bird) {
      this.isEditMode = true;
      this.pageTitle = 'Editar ave';
      // inicializar formulario con la entidad pasada
      this.initForm();
    } else if (this.birdId) {
      this.isEditMode = true;
      this.pageTitle = 'Editar ave';
      this.loadBirdData();
    } else if (routeId) {
      this.birdId = routeId;
      this.isEditMode = true;
      this.pageTitle = 'Editar ave';
      this.loadBirdData();
    } else {
      // Inicializar formulario vacío para crear
      this.initForm();
    }
  }
  
  private async loadBirdData(): Promise<void> {
    // Si la entidad ya fue pasada como input, no recargamos
    if (this.bird) return;
    if (!this.birdId) return;
    
    try {
      this.error = null;
      this.bird = await this.birdRepository.getBirdById(this.birdId);
      
      if (!this.bird) {
        this.error = `Ave con ID ${this.birdId} no encontrada`;
        return;
      }
      
      // Una vez tenemos los datos, inicializar formulario
      this.initForm();
    } catch (err: any) {
      this.error = `Error al cargar el ave: ${err.message || 'Error desconocido'}`;
      console.error('Error loading bird:', err);
    }
  }
  
  private initForm(): void {
    this.birdForm = this.fb.group({
      commonName: [this.bird?.commonName || '', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      scientificName: [this.bird?.scientificName || '', [
        Validators.required
      ]],
      family: [this.bird?.family || null, [
        Validators.required
      ]],
      notes: [this.bird?.notes || ''],
      conservationStatus: [this.bird?.conservationStatus || ConservationStatusEnum.notEvaluated, [
        Validators.required
      ]]
    });
  }
  
  // Getters para facilitar acceso en la plantilla
  get commonName() { return this.birdForm.get('commonName'); }
  get scientificName() { return this.birdForm.get('scientificName'); }
  get family() { return this.birdForm.get('family'); }
  get notes() { return this.birdForm.get('notes'); }
  get conservationStatus() { return this.birdForm.get('conservationStatus'); }
  
  // Determinar si un campo tiene errores
  hasError(controlName: string): boolean {
    if (!this.birdForm) return false;
    const control = this.birdForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  async onSubmit(): Promise<void> {
    // clear previous server-side errors
    this.formErrors.clearServerErrors(this.birdForm);

    if (this.birdForm.invalid) {
      this.markFormGroupTouched(this.birdForm);
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    this.successMessage = null;
    
    try {
      if (this.isEditMode && this.birdId) {
        // Modo edición: usar el caso de uso de actualización para respetar la lógica de dominio
        const updated = await this.updateBirdUseCase.execute(this.birdId, this.birdForm.value);
        this.bird = updated; // actualizar el estado local con la entidad retornada
        this.successMessage = '¡Ave actualizada correctamente!';
        this.saved.emit(updated);
        
        // Navegar de vuelta a la lista después de 1 segundo para que el usuario vea el mensaje
        setTimeout(() => {
          this.router.navigate(['/birds']);
        }, 1000);
      } else {
        // Modo creación
        const created = await this.addBirdUseCase.execute(this.birdForm.value);
        this.successMessage = '¡Ave agregada correctamente!';
        this.resetForm(); // Limpiar después de crear
        this.saved.emit(created);
        
        // Navegar de vuelta a la lista después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/birds']);
        }, 1000);
      }
      
    } catch (err: any) {
      // map server validation errors if present
      const payload = err?.errors ?? err;
      try {
        this.formErrors.mapServerErrorsToForm(this.birdForm, payload);
      } catch (mapErr) {
        // fall back to generic error handling
      }

      // Manejo específico de errores conocidos
      if (err.message?.includes('EXPERT')) {
        this.error = 'Solo usuarios expertos pueden agregar o modificar aves';
      } else {
        this.error = err.message || 'Ha ocurrido un error al procesar la solicitud';
      }
      console.error('Error submitting bird form:', err);
    } finally {
      this.isSubmitting = false;
    }
  }
  
  resetForm(): void {
    if (this.isEditMode && this.bird) {
      // En modo edición, volver a cargar datos originales
      this.birdForm.reset({
        commonName: this.bird.commonName,
        scientificName: this.bird.scientificName,
        family: this.bird.family,
        notes: this.bird.notes,
        conservationStatus: this.bird.conservationStatus
      });
    } else {
      // En modo creación, limpiar todo
      this.birdForm.reset({
        conservationStatus: ConservationStatusEnum.notEvaluated
      });
    }
  }
  
  goBack(): void {
    this.router.navigate(['/birds']);
  }
  
  // Marcar todos los campos como touched para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}

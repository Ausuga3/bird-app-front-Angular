import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BirdRepository } from '../../../../domain/repositories/bird.repository';
import { AddBirdUseCase } from '../../../../aplication/use-cases/add-bird.use-case';
import { Bird, BirdFamily, ConservationStatusEnum } from '../../../../domain/entities/bird.interface';
import { BirdLocalRepository } from '../../../../infrastructure/repositories/bird-local.repository';

@Component({
  selector: 'app-form-bird',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-bird.component.html',
  styleUrl: './form-bird.component.css',
  providers: [
    // Asegúrate de proporcionar todos los servicios necesarios
    { provide: BirdRepository, useClass: BirdLocalRepository },
    AddBirdUseCase
    // AuthStateService ya está providenciado en root con { providedIn: 'root' }
  ]
})
export class FormBirdComponent implements OnInit {
  birdForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Para determinar si estamos en modo edición
  birdId: string | null = null;
  bird: Bird | null = null;
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
    private addBirdUseCase: AddBirdUseCase
  ) {}
  
  ngOnInit(): void {
    // Verificar si estamos en modo edición
    this.birdId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.birdId;
    
    if (this.isEditMode) {
      this.pageTitle = 'Editar ave';
      this.loadBirdData();
    } else {
      // Inicializar formulario vacío para crear
      this.initForm();
    }
  }
  
  private async loadBirdData(): Promise<void> {
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
    const control = this.birdForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  async onSubmit(): Promise<void> {
    if (this.birdForm.invalid) {
      this.markFormGroupTouched(this.birdForm);
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    this.successMessage = null;
    
    try {
      if (this.isEditMode && this.birdId) {
        // Modo edición
        await this.birdRepository.editBird(this.birdId, this.birdForm.value);
        this.successMessage = '¡Ave actualizada correctamente!';
      } else {
        // Modo creación
        await this.addBirdUseCase.execute(this.birdForm.value);
        this.successMessage = '¡Ave agregada correctamente!';
        this.resetForm(); // Limpiar después de crear
      }
      
    } catch (err: any) {
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

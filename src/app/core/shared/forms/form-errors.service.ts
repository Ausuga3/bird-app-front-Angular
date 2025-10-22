import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

type ServerErrors = Record<string, string | string[]> | null | undefined;

@Injectable({ providedIn: 'root' })
export class FormErrorsService {
  /**
   * Map a server-side validation error payload into FormGroup controls.
   * Supports nested control paths using dot notation (e.g. "coordinates.latitude").
   * If a control is not found the error is attached at the form level under `form.errors.server`.
   */
  mapServerErrorsToForm(form: FormGroup, errors: ServerErrors): void {
    if (!errors) return;

    Object.entries(errors).forEach(([key, value]) => {
      const messages = Array.isArray(value) ? value : [String(value)];
      const control = this.getControlByPath(form, key);

      if (control) {
        // merge server error into control.errors under the `server` key
        const existing = control.errors ?? {};
        const serverMsg = messages.join(' | ');
        control.setErrors({ ...existing, server: serverMsg });
        control.markAsTouched();
      } else {
        // attach to form-level errors
        const formErrors = form.errors ?? {};
        form.setErrors({ ...formErrors, server: { ...(formErrors['server'] ?? {}), [key]: messages } });
      }
    });
  }

  /**
   * Read a friendly error message for a control path. Returns null when there's no error.
   */
  getFieldErrorMessage(form: FormGroup, path: string): string | null {
    const control = this.getControlByPath(form, path);
    if (!control) return null;

    // server-side message has precedence
    const server = control.errors?.['server'];
    if (server) return String(server);

    // common Angular validator messages (customize i18n/text as needed)
    const errors = control.errors ?? {};
    if (errors['required']) return 'Campo requerido';
    if (errors['email']) return 'Formato de correo inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo ${errors['min'].min}`;
    if (errors['max']) return `Valor máximo ${errors['max'].max}`;

    // fallback: return the first error key as string
    const firstKey = Object.keys(errors)[0];
    return firstKey ? String(errors[firstKey]) : null;
  }

  /**
   * Clears server-side errors previously attached to controls or the form.
   */
  clearServerErrors(form: FormGroup): void {
    // clear control-level server errors
    this.forEachControl(form, control => {
      if (control.errors && control.errors['server']) {
        const { server, ...rest } = control.errors;
        // if there are no other errors, setErrors(null)
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });

    // clear form-level server errors
    if (form.errors && form.errors['server']) {
      const { server, ...rest } = form.errors as any;
      form.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  // --- Helpers ---
  private getControlByPath(form: FormGroup, path: string): AbstractControl | null {
    if (!path) return null;
    // allow both dot and bracket notation: coordinates.latitude or coordinates[latitude]
    const normalized = path.replace(/\[(\w+)\]/g, '.$1');
    try {
      return form.get(normalized) as AbstractControl | null;
    } catch {
      return null;
    }
  }

  private forEachControl(form: FormGroup, fn: (c: AbstractControl) => void): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      if (control instanceof FormGroup) {
        this.forEachControl(control as FormGroup, fn);
      } else {
        fn(control as AbstractControl);
      }
    });
  }
}

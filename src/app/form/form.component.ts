import {
  Component,
  ElementRef,
  ViewChild,
  WritableSignal,
  effect,
  signal,
} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, map, startWith } from 'rxjs';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { isEqual } from 'lodash';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  public matcher = new MyErrorStateMatcher();
  public techStacks: string[] = ['Angular'];
  public allTechStacks: string[] = ['Angular', 'Ngrx', 'Rxjs', 'Jest', 'Scss'];
  public filteredTechStacks$: Observable<string[]>;
  public separatorKeysCodes = [COMMA, ENTER];
  public registerForm = new FormGroup({
    firstNameControl: new FormControl('', [Validators.required]),
    lastNameControl: new FormControl('', [Validators.required]),
    emailControl: new FormControl('', [Validators.required, Validators.email]),
    techStacksControl: new FormControl(''),
    // TODO: add form group in form  group
    // TODO: add input with debounce
    // TODO: add custom control
    // TODO: Read about Web Components
    // TODO: Add backend
  });

  private formValue: WritableSignal<FormGroup | null> = signal(null, {
    equal: isEqual,
  });

  @ViewChild('techStacksInput') techStacksInput!: ElementRef<HTMLInputElement>;

  public get emailFormControl(): FormControl {
    return this.registerForm.get('emailControl') as FormControl;
  }

  public get techStacksFormControl(): FormControl {
    return this.registerForm.get('techStacksControl') as FormControl;
  }

  constructor(private announcer: LiveAnnouncer) {
    this.filteredTechStacks$ = this.techStacksFormControl?.valueChanges.pipe(
      startWith(null),
      map(() =>
        this.allTechStacks.filter(
          (techStack: string) => !this.techStacks?.find(ts => ts === techStack)
        )
      )
    );

    effect(() => {
      console.log(`The form value is: ${this.formValue()})`);
    });
  }

  public onSubmit(): void {
    this.techStacksFormControl.setValue(this.techStacks);
    this.formValue.set(this.registerForm.value as FormGroup);
    console.log('this.formValue', this.formValue());

    console.log('form value:', this.registerForm.value);
  }

  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.techStacks.push(value);
    }

    event.chipInput!.clear();

    this.techStacksFormControl.setValue(null);
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    this.techStacks.push(event.option.viewValue);
    this.techStacksInput.nativeElement.value = '';
    this.techStacksFormControl.setValue(null);
  }

  public remove(techStack: string): void {
    const index = this.techStacks.indexOf(techStack);

    if (index >= 0) {
      this.techStacks.splice(index, 1);

      this.announcer.announce(`Removed ${techStack}`);
      this.techStacksFormControl.setValue(null);
    }
  }
}

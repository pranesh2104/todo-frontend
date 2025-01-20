import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);

  constructor() { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}

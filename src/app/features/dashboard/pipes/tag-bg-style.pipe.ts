import { Pipe, PipeTransform } from '@angular/core';
import { ITaskTagInput } from '../models/task.model';

@Pipe({
  name: 'tagBgStyle',
  pure: true
})
export class TagBgStylePipe implements PipeTransform {

  transform(chip: ITaskTagInput): { [key: string]: string } {
    const color = chip.color;
    if (color) {

      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return {
        'background-color': color,
        'color': brightness > 125 ? '#000000' : '#ffffff'
      }
    }
    else {
      return {
        'background-color': '#fff',
        'color': '#000000'
      }
    }
  }

}

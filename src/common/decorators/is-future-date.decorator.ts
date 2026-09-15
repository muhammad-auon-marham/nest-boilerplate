import { registerDecorator, ValidationOptions } from 'class-validator';
import * as dayjs from 'dayjs';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // skip if value is empty (handled by IsNotEmpty/IsOptional)
          const date = dayjs(value);
          const today = dayjs().startOf('day');
          return date.isValid() && (date.isSame(today) || date.isAfter(today));
        },
        defaultMessage() {
          return 'Date must be today or in the future';
        },
      },
    });
  };
}

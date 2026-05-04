import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum ActionValidation {
  VALIDER = 'VALIDER',
  REJETER = 'REJETER',
}

export class ValiderDepotDto {
  @IsEnum(ActionValidation)
  action!: ActionValidation;

  @IsString()
  @IsNotEmpty()
  validateurId!: string;

  @IsString()
  motifRejet?: string; // Obligatoire si action = REJETER
}

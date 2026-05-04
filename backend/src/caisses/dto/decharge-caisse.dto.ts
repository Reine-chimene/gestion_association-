import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class DechargeCaisseDto {
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  montant!: number;

  @IsString()
  motif!: string;

  @IsString()
  @MinLength(10, { message: 'La justification doit contenir au moins 10 caractères' })
  justification!: string;
}

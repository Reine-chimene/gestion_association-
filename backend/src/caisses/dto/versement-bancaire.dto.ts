import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class VersementBancaireDto {
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  montant!: number;

  @IsString()
  motif!: string;

  @IsString()
  @MinLength(5, { message: 'La référence bancaire doit contenir au moins 5 caractères' })
  reference!: string;
}

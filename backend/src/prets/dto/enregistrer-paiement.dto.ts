import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class EnregistrerPaiementDto {
  @IsString()
  echeanceId!: string;

  @IsNumber()
  @Min(0)
  montant!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

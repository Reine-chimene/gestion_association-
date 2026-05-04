import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';

export class CrediterCaisseDto {
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  montant!: number;

  @IsString()
  motif!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

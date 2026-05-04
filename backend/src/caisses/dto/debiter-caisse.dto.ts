import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class DebiterCaisseDto {
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  montant!: number;

  @IsString()
  motif!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

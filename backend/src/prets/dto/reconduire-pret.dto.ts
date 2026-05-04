import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ReconduirePretDto {
  @IsNumber()
  @Min(1)
  nouvelledureeEnMois!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nouveauTauxInteret?: number;

  @IsOptional()
  @IsString()
  motif?: string;
}

import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateComplementFondsDto {
  @IsInt()
  @Min(2000)
  annee!: number;

  @IsNumber()
  @IsPositive()
  montantTotal!: number;

  @IsNumber()
  @IsPositive()
  montantParMembre!: number;
}

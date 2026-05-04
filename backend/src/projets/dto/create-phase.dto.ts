import { IsString, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsNumber()
  @Min(0)
  objectif!: number;

  @IsDateString()
  dateLimite!: string;

  @IsNumber()
  @Min(1)
  ordre!: number;
}

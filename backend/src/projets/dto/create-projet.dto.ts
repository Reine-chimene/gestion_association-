import { IsString, IsNotEmpty, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';
import { DureeProjet } from '@prisma/client';

export class CreateProjetDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(DureeProjet)
  duree!: DureeProjet;

  @IsNumber()
  @Min(0)
  objectif!: number;

  @IsBoolean()
  @IsOptional()
  ephemere?: boolean;

  @IsBoolean()
  @IsOptional()
  obligatoire?: boolean;

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;
}

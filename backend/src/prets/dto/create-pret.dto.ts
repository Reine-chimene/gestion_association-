import { IsString, IsNumber, IsEnum, IsArray, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TypePret {
  ORDINAIRE = 'ORDINAIRE',
  SOCIAL = 'SOCIAL',
  URGENT = 'URGENT',
  INVESTISSEMENT = 'INVESTISSEMENT',
  SOLIDARITE = 'SOLIDARITE',
}

export enum TypeGarantie {
  MATERIELLE = 'MATERIELLE',
  CAUTION_SOLIDAIRE = 'CAUTION_SOLIDAIRE',
  EPARGNE_BLOQUEE = 'EPARGNE_BLOQUEE',
  SALAIRE = 'SALAIRE',
}

export class GarantieDto {
  @IsEnum(TypeGarantie)
  type!: TypeGarantie;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  valeurEstimee!: number;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class CoEmprunteurDto {
  @IsString()
  membreId!: string;

  @IsNumber()
  @Min(0)
  partResponsabilite!: number; // Pourcentage (0-100)
}

export class CreatePretDto {
  @IsString()
  emprunteurId!: string;

  @IsEnum(TypePret)
  type!: TypePret;

  @IsNumber()
  @Min(0)
  montant!: number;

  @IsNumber()
  @Min(0)
  tauxInteret!: number; // Pourcentage annuel

  @IsNumber()
  @Min(1)
  dureeEnMois!: number;

  @IsString()
  motif!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GarantieDto)
  garanties!: GarantieDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoEmprunteurDto)
  coEmprunteurs?: CoEmprunteurDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

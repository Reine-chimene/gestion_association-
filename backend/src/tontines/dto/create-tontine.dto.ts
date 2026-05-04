import { IsString, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ParticipantDto {
  @IsString()
  membreId!: string;

  @IsNumber()
  @Min(1)
  nombreParts!: number;

  @IsNumber()
  @Min(1)
  ordre!: number;
}

export class CreateTontineDto {
  @IsString()
  nom!: string;

  @IsEnum(['CLASSIQUE_NON_VENDABLE', 'VENDABLE_ENCHERE', 'VENTE_INTERETS', 'HYBRIDE'])
  type!: 'CLASSIQUE_NON_VENDABLE' | 'VENDABLE_ENCHERE' | 'VENTE_INTERETS' | 'HYBRIDE';

  @IsNumber()
  @Min(0.01)
  montantCotisation!: number;

  @IsEnum(['JOURNALIERE', 'HEBDOMADAIRE', 'MENSUELLE'])
  frequence!: 'JOURNALIERE' | 'HEBDOMADAIRE' | 'MENSUELLE';

  @IsDateString()
  dateDebut!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants!: ParticipantDto[];
}

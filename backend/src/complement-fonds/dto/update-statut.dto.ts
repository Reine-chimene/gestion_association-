import { IsEnum, IsString, IsOptional } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['ACTIF', 'AUGMENTE', 'CASSE'])
  statut!: 'ACTIF' | 'AUGMENTE' | 'CASSE';

  @IsString()
  @IsOptional()
  motif?: string;
}

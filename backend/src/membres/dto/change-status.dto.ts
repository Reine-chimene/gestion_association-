import { IsString, IsEnum, MinLength } from 'class-validator';

export class ChangeStatusDto {
  @IsEnum(['ACTIF', 'OBSERVATION', 'DEMISSIONNAIRE', 'DECEDE', 'MUTE'])
  statut!: 'ACTIF' | 'OBSERVATION' | 'DEMISSIONNAIRE' | 'DECEDE' | 'MUTE';

  @IsString()
  @MinLength(10, { message: 'Le motif doit contenir au moins 10 caractères' })
  motif!: string;
}

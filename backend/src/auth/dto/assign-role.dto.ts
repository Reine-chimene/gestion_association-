import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';

export enum Role {
  PRESIDENT = 'PRESIDENT',
  TRESORIER = 'TRESORIER',
  SECRETAIRE = 'SECRETAIRE',
  COMMISSAIRE = 'COMMISSAIRE',
  MEMBRE = 'MEMBRE',
}

export class AssignRoleDto {
  @IsUUID()
  userId!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  @IsOptional()
  motif?: string;
}

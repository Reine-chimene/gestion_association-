import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class ContribuerProjetDto {
  @IsString()
  @IsNotEmpty()
  membreId!: string;

  @IsNumber()
  @Min(0)
  montant!: number;

  @IsBoolean()
  @IsOptional()
  volontaire?: boolean;
}

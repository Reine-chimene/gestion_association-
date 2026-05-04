import { IsString, IsNumber, Min } from 'class-validator';

export class VendreTourDto {
  @IsString()
  acheteurId!: string;

  @IsNumber()
  @Min(1)
  tourOriginal!: number;

  @IsNumber()
  @Min(0.01)
  montantOffre!: number;
}

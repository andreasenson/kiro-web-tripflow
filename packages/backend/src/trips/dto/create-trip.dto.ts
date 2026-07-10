import { IsString, MinLength, MaxLength, Length, IsIn, IsOptional } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  destination!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsOptional()
  @IsString()
  @IsIn(['planning', 'travelling', 'completed'])
  status?: 'planning' | 'travelling' | 'completed';
}

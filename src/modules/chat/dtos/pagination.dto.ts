import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class PageBasedPaginationDTO {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  limit: number = 10;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  offset: number = 0;
}

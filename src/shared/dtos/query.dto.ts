import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { IOrder, IQuery } from '../interface/query.interface';
import { convertQueryParamsToObject } from '../repositories/findAndPaginate';

export class QueryDto<T> implements IQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  order?: IOrder;

  @ApiProperty({ required: false, description: 'Filter parameters as an object' })
  @IsOptional()
  @Transform(({ value }) => convertQueryParamsToObject(value), { toClassOnly: true })
  @Type(() => Object)
  filter?: IOrder<T>;

  @ApiProperty({ required: false, description: 'Filter parameters as an object' })
  @IsOptional()
  @Transform(({ value }) => convertQueryParamsToObject(value), { toClassOnly: true })
  @Type(() => Object)
  filterOr?: IOrder<T>;

  @ApiProperty({ required: false, description: 'Filter parameters as an object' })
  @IsOptional()
  @Transform(({ value }) => convertQueryParamsToObject(value), { toClassOnly: true })
  @Type(() => Object)
  search?: IOrder<T>;
}

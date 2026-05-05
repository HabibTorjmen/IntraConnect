import { IsArray, IsOptional, IsString } from 'class-validator';

export class BulkEmployeeIdsDTO {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class BulkUpdateDTO extends BulkEmployeeIdsDTO {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  contractType?: string;
}

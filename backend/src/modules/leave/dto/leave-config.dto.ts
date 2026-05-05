import { IsBoolean, IsInt, IsOptional, IsString, IsArray, Min } from 'class-validator';

export class UpsertLeaveTypeDTO {
  @IsString() code: string;
  @IsString() name: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

export class UpsertLeavePolicyDTO {
  @IsString() leaveTypeId: string;

  @IsInt() @Min(0) @IsOptional() annualEntitlementDays?: number;
  @IsString() @IsOptional() accrualMethod?: 'annual_grant' | 'monthly';
  @IsBoolean() @IsOptional() carryForwardAllowed?: boolean;
  @IsInt() @Min(0) @IsOptional() maxCarryForwardDays?: number;
  @IsInt() @Min(0) @IsOptional() carryForwardExpiryMonths?: number;
  @IsInt() @Min(1) @IsOptional() minDaysPerRequest?: number;
  @IsInt() @Min(1) @IsOptional() maxDaysPerRequest?: number;
  @IsInt() @Min(0) @IsOptional() advanceNoticeDays?: number;
  @IsArray() @IsOptional() blackoutPeriods?: Array<{ start: string; end: string; reason?: string }>;
  @IsArray() @IsOptional() weekendDays?: number[];
  @IsBoolean() @IsOptional() allowNegativeBalance?: boolean;
}

export class CreateHolidayDTO {
  @IsString() date: string;
  @IsString() name: string;
  @IsBoolean() @IsOptional() recurring?: boolean;
}

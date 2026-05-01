import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  async create(@Body() data: CreateEmployeeDTO, @AuthUser() user: any) {
    return this.employeeService.create(data, user);
  }

  // Get all employees
  @Get()
  async findAll(@AuthUser() user: any) {
    return this.employeeService.findAll(user);
  }

  // Advanced search
  @Get('search/advanced')
  async search(
    @AuthUser() user: any,
    @Query('q') query?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeService.search(user, query, departmentId, status);
  }

  // Bulk import employees
  @Post('bulk')
  async bulkImport(@Body() employees: CreateEmployeeDTO[], @AuthUser() user: any) {
    return this.employeeService.bulkImport(employees, user);
  }

  // Get a single employee by ID
  @Get(':id')
  async findOne(@Param('id') id: string, @AuthUser() user: any) {
    const employee = await this.employeeService.findOne(id, user);
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  // Update an employee
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDTO,
    @AuthUser() user: any,
  ) {
    return this.employeeService.update(id, data, user);
  }

  // Delete an employee
  @Delete(':id')
  async remove(@Param('id') id: string, @AuthUser() user: any) {
    return this.employeeService.remove(id, user);
  }
}

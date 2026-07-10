import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('trips/:tripId')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  // Budget Categories
  @Post('budget/categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Param('tripId') tripId: string, @Body() dto: CreateBudgetCategoryDto) {
    return this.budgetService.createCategory(tripId, dto);
  }

  @Get('budget/categories')
  findAllCategories(@Param('tripId') tripId: string) {
    return this.budgetService.findAllCategories(tripId);
  }

  @Patch('budget/categories/:id')
  updateCategory(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetCategoryDto,
  ) {
    return this.budgetService.updateCategory(tripId, id, dto);
  }

  @Delete('budget/categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('tripId') tripId: string, @Param('id') id: string) {
    return this.budgetService.removeCategory(tripId, id);
  }

  // Expenses
  @Post('expenses')
  @HttpCode(HttpStatus.CREATED)
  createExpense(@Param('tripId') tripId: string, @Body() dto: CreateExpenseDto) {
    return this.budgetService.createExpense(tripId, dto);
  }

  @Get('expenses')
  findAllExpenses(@Param('tripId') tripId: string) {
    return this.budgetService.findAllExpenses(tripId);
  }

  @Patch('expenses/:id')
  updateExpense(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.budgetService.updateExpense(tripId, id, dto);
  }

  @Delete('expenses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExpense(@Param('tripId') tripId: string, @Param('id') id: string) {
    return this.budgetService.removeExpense(tripId, id);
  }

  // Budget Summary
  @Get('budget/summary')
  getSummary(@Param('tripId') tripId: string) {
    return this.budgetService.getSummary(tripId);
  }
}

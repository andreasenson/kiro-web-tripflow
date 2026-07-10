import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BudgetCategoryEntity } from './entities/budget-category.entity';
import { ExpenseEntity } from './entities/expense.entity';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(BudgetCategoryEntity)
    private readonly categoryRepository: Repository<BudgetCategoryEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepository: Repository<ExpenseEntity>,
  ) {}

  // Budget Categories
  async createCategory(tripId: string, dto: CreateBudgetCategoryDto): Promise<BudgetCategoryEntity> {
    const category = this.categoryRepository.create({
      id: uuidv4(),
      tripId,
      name: dto.name,
      allocatedAmount: dto.allocatedAmount,
    });
    return this.categoryRepository.save(category);
  }

  async findAllCategories(tripId: string): Promise<BudgetCategoryEntity[]> {
    return this.categoryRepository.find({ where: { tripId } });
  }

  async findOneCategory(tripId: string, id: string): Promise<BudgetCategoryEntity> {
    const category = await this.categoryRepository.findOne({ where: { id, tripId } });
    if (!category) {
      throw new NotFoundException(`Budget category with id ${id} not found`);
    }
    return category;
  }

  async updateCategory(tripId: string, id: string, dto: UpdateBudgetCategoryDto): Promise<BudgetCategoryEntity> {
    const category = await this.findOneCategory(tripId, id);
    Object.assign(category, dto);
    await this.categoryRepository.save(category);
    return this.findOneCategory(tripId, id);
  }

  async removeCategory(tripId: string, id: string): Promise<void> {
    const category = await this.findOneCategory(tripId, id);
    await this.categoryRepository.remove(category);
  }

  // Expenses
  async createExpense(tripId: string, dto: CreateExpenseDto): Promise<ExpenseEntity> {
    const expense = this.expenseRepository.create({
      id: uuidv4(),
      tripId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      currency: dto.currency,
      note: dto.note ?? null,
      date: dto.date,
    });
    return this.expenseRepository.save(expense);
  }

  async findAllExpenses(tripId: string): Promise<ExpenseEntity[]> {
    return this.expenseRepository.find({ where: { tripId } });
  }

  async findOneExpense(tripId: string, id: string): Promise<ExpenseEntity> {
    const expense = await this.expenseRepository.findOne({ where: { id, tripId } });
    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }
    return expense;
  }

  async updateExpense(tripId: string, id: string, dto: UpdateExpenseDto): Promise<ExpenseEntity> {
    const expense = await this.findOneExpense(tripId, id);
    Object.assign(expense, dto);
    await this.expenseRepository.save(expense);
    return this.findOneExpense(tripId, id);
  }

  async removeExpense(tripId: string, id: string): Promise<void> {
    const expense = await this.findOneExpense(tripId, id);
    await this.expenseRepository.remove(expense);
  }

  // Budget Summary
  async getSummary(tripId: string) {
    const categories = await this.findAllCategories(tripId);
    const expenses = await this.findAllExpenses(tripId);

    const totalAllocated = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = categories.map((category) => {
      const categoryExpenses = expenses.filter((e) => e.categoryId === category.id);
      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        categoryId: category.id,
        name: category.name,
        allocated: category.allocatedAmount,
        spent,
        remaining: category.allocatedAmount - spent,
      };
    });

    return {
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      categories: categoryBreakdown,
    };
  }
}

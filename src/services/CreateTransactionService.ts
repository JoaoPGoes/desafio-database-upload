import { getRepository, getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value)
      throw new AppError('Unable to perform this transaction');

    const categoryAlreadyExists = await categoryRepository.findOne({
      where: { category },
    });

    if (categoryAlreadyExists) {
      const categoryId = categoryAlreadyExists?.id;

      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category_id: categoryId,
      });
      await transactionRepository.save(transaction);

      return transaction;
    }

    const newCategory = categoryRepository.create({
      title: category,
    });

    await categoryRepository.save(newCategory);

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: newCategory.id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

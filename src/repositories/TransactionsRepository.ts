import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const data = await this.find();

    const { income, outcome } = data.reduce(
      (acumulador: Balance, elemento: Transaction) => {
        if (elemento.type === 'income') {
          // eslint-disable-next-line no-param-reassign
          acumulador.income += Number(elemento.value);
        } else {
          // eslint-disable-next-line no-param-reassign
          acumulador.outcome += Number(elemento.value);
        }

        return acumulador;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;

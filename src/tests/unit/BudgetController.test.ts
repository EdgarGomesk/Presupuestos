import { createRequest, createResponse } from 'node-mocks-http'
import { budgets } from "../mocks/budgets"
import Budget from '../../models/Budget'
import { BudgetController } from '../../controller/BudgetController'

jest.mock('../../models/Budget', () => ({
    findAll: jest.fn()
}))

describe('BudgetController.getAll', () => {

    // Se ejecuta antes de que cada Test se ejecute
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            console.log(options)
            const updatedBudgets = budgets.filter(budget => budget.userId === options.where.userId);
            return Promise.resolve(updatedBudgets)
        })
    })

    it('Should retrieve 2 budgets for user with ID 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(2);
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('Should retrieve 1 budget for user with ID 2', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 2 }
        })

        const res = createResponse();

        const updatedBudgets = budgets.filter(budget => budget.userId === req.user.id);
        (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets)
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(1);
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('Should retrieve 0 budgets for user with ID 10', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 10 }
        })

        const res = createResponse();

        const updatedBudgets = budgets.filter(budget => budget.userId === req.user.id);
        (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets)
        await BudgetController.getAll(req, res)

        const data = res._getJSONData()
        expect(data).toHaveLength(0);
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
})
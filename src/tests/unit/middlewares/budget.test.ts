import { createRequest, createResponse } from "node-mocks-http"
import { hasAccess, validateBugetExits } from "../../../middleware/budget"
import Budget from "../../../models/Budget"
import { budgets } from "../../mocks/budgets"

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn(),
    update: jest.fn()
}))


describe('budget - validateBugetExits', () => {
    it('should handle non-existent budget', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBugetExits(req, res, next)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'Presupuesto no encontrado'})
        
    })

    it('Should force error budget', async () => {

        (Budget.findByPk as jest.Mock).mockRejectedValue(null)

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBugetExits(req, res, next)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(next).not.toHaveBeenCalled()
        
    })

    it('should proceed to next middleware if budget exists', async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBugetExits(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.budget).toEqual(budgets[0])
    })
})

describe('Budget - hasAccess', () => {
    it('should call next() if user has access to budget', () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: 1 }
        });
        const res = createResponse();
        const next = jest.fn();

        hasAccess(req, res, next);

        expect(next).toHaveBeenCalled()
    })

    it('should return 401 error if userId does not have access to budget', () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: 2 }
        });
        const res = createResponse();
        const next = jest.fn();
        

        hasAccess(req, res, next);

        const data = res._getJSONData();
        
        expect(next).not.toHaveBeenCalled()
        expect(data).toEqual({error: 'Accion no valida'})
        expect(res.statusCode).toBe(401)
    })
})
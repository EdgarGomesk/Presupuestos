import type { Request, Response } from "express"
import Budget from "../models/Budget"
import Expense from "../models/Expense"

export class BudgetController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user.id
                }
            })

            res.json(budgets)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static create = async (req: Request, res: Response) => {

        try {
            const buget = new Budget(req.body)
            buget.userId = req.user.id
            await buget.save()
            res.status(201).json('Presupuesto creado')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getById = async (req: Request, res: Response) => {
        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense]
        })
        
        res.status(200).json(budget)
    }

    static updateById = async (req: Request, res: Response) => {
        await req.budget.update(req.body)

        res.json('presupuesto actualizado correctamente')
    }

    static deleteById = async (req: Request, res: Response) => {
        await req.budget.destroy()
        res.json('Presupuesto eliminado correctamente')
    }
}
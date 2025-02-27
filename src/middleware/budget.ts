import { Response, Request, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Budget from "../models/Budget"

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const validateBugetId = async (req: Request, res: Response, next: NextFunction) => {


    await param('budgetId').isInt().withMessage('ID no valido')
        .custom(value => value > 0).withMessage("Id no valido").run(req)

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }

    next()
}


export const validateBugetExits = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { budgetId } = req.params

        const budget = await Budget.findByPk(budgetId)

        if(!budget) {
            const error = new Error("Presupuesto no encontrado")
            res.status(400).json({error: error.message})
            return
        }
        req.budget = budget
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
    
}

export const validateBugetInput= async (req: Request, res: Response, next: NextFunction) => {
    
    await body('name').notEmpty().withMessage('El nombre del presupuesto no puede ir vacio').run(req)
    
    await body('amount').notEmpty().withMessage('El monto No puede ser valido')
            .isNumeric().withMessage('El monto debe ser un numero')
            .custom(value => value > 0).withMessage("Presupuesto debe ser mayor a cero").run(req)
        
    next()
   
}

export function hasAccess(req: Request, res: Response, next: NextFunction) {
    if(req.budget.userId !== req.user.id) {
        const error = new Error('Accion no valida')
        res.status(404).json({ error: error.message })
        return
    }
    next()
}


import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controller/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import {  hasAccess, validateBugetExits, validateBugetId, validateBugetInput } from "../middleware/budget";
import { ExpensesController } from "../controller/ExpenseController";
import { validateExpenseExists, validateExpenseId, validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";
const router = Router()


router.use(authenticate)

/** Todo endpoint que tenga reciba un parametro id, ejecutara los middlewares */
router.param('budgetId', validateBugetId)

router.param('budgetId', validateBugetExits)

router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExists)
/** RUTAS */

router.get("/", BudgetController.getAll)

router.get("/:budgetId", BudgetController.getById)

router.post("/", validateBugetInput, handleInputErrors, BudgetController.create)

router.put("/:budgetId", validateBugetInput, handleInputErrors, BudgetController.updateById)

router.delete("/:budgetId", BudgetController.deleteById)

/** Routes for expenses */

/** Patron ROA Arquitectura orientada a recuersos */

router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById)

router.post("/", validateExpenseInput, handleInputErrors, ExpensesController.create)

router.put("/:budgetId/expenses/:expenseId", validateExpenseInput, handleInputErrors, ExpensesController.updateById)

router.put("/:budgetId/expenses/:expenseId", ExpensesController.deleteById)

export default router
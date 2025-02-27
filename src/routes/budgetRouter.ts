import { Router } from "express";
import { body, param } from "express-validator";
import { ButdgetController } from "../controller/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import {  hasAccess, validateBugetExits, validateBugetId, validateBugetInput } from "../middleware/budget";
import { ExpensesController } from "../controller/ExpenseController";
import { validateExpenseExits, validateExpenseId, validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";
const router = Router()


router.use(authenticate)

/** Todo endpoint que tenga reciba un parametro id, ejecutara los middlewares */
router.param('budgetId', validateBugetId)

router.param('budgetId', validateBugetExits)

router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExits)
/** RUTAS */

router.get("/", ButdgetController.getAll)

router.get("/:budgetId", ButdgetController.getById)

router.post("/", validateBugetInput, handleInputErrors, ButdgetController.create)

router.put("/:budgetId", validateBugetInput, handleInputErrors, ButdgetController.updateById)

router.delete("/:budgetId", ButdgetController.deleteById)

/** Routes for expenses */

/** Patron ROA Arquitectura orientada a recuersos */

router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById)

router.post("/:budgetId/expenses", validateExpenseInput, handleInputErrors, ExpensesController.create)

router.put("/:budgetId/expenses/:expenseId", validateExpenseInput, handleInputErrors, ExpensesController.updateById)

router.put("/:budgetId/expenses/:expenseId", ExpensesController.deleteById)

export default router
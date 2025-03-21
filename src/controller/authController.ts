import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPasword } from "../utils/auth"
import { AuthEmail } from "../email/AuthEmail"
import { generateToken } from "../utils/token"
import { generateJWT } from "../utils/jwt"
import { authenticate } from "../middleware/auth"

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        const { email, password } = req.body

        // prevenir dublipacados

        const userExists = await User.findOne({
            where: { email }
        })
        if (userExists) {
            const error = new Error('El usuario ya existe')
            res.status(409).json({ error: error.message })
            return
        }const createAccountMock = jest.spyOn(AuthController, 'createAccount')
        try {
            const user = await User.create(req.body)

            user.password = await hashPasword(password)
            
            const token = generateToken();
            user.token = token;

            if(process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackrConfirmationToken = token
            }

           
            await user.save()
            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })
            res.status(201).json('cuenta Creada Correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne( { where: { token } } )

        if (!user) {
            const error = new Error('Token no valido')
            res.status(401).json({ error: error.message })
            return
        }

        user.confirmed = true
        user.token = null
        await user.save()

        res.json('Cuenta confirmada correctamente')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        // prevenir dublipacados

        const user = await User.findOne({
            where: { email }
        })
        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }
        if (!user.confirmed) {
            const error = new Error('La cuenta no ha sido confirmada')
            res.status(403).json({ error: error.message })
            return
        }

        const passwordIsCorrect = await checkPassword(password, user.password)

        if (!passwordIsCorrect) {
            const error = new Error('La contraseña es incorrecta')
            res.status(401).json({ error: error.message })
            return
        }
        const token = generateJWT(user.id)

        res.json(token)


    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        // prevenir dublipacados

        const user = await User.findOne({
            where: { email }
        })
        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }
        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json("revisa tu email para instrucciones")
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body
        const tokenExists = await User.findOne({ where: { token } })
        if (!tokenExists) {
            const error = new Error('token no valido')
            res.status(404).json({ error: error.message })
            return
        }
        res.json('token valido')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body
        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('token no valido')
            res.status(404).json({ error: error.message })
            return
        }

        user.password = await hashPasword(password)
        user.token = null
        await user.save()

        res.json("password modificado correctamente")
    }


    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurremtUserPassword = async (req: Request, res: Response) => {
        
        const { password, current_password } = req.body
        const { id } = req.user
        const user = await User.findByPk(id)

        const isPasswordCorrect = checkPassword(current_password, user.password)

        if(!isPasswordCorrect) {
            const error = new Error('El password no es correcto')
            res.status(404).json({ error: error.message })
            return
        }
        user.password = await hashPasword(password)
        await user.save()

        res.json("El password se modifico correctamente")
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El Password actual es incorrecto')
            res.status(401).json({ error: error.message })
            return
        }
        res.json('Password Correcto')
    }
}

import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}


export class AuthEmail {
    static sendConfirmationEmail = async (user : EmailType) =>{
        const email = await transport.sendMail({
            from: 'CashTrachr <admin@cashtrackr.com',
            to: user.email,
            subject: 'CashTrackr Confirma tu cuenta',
            html: `
            <p>Hola: ${user.name}, has creado tu cuenta en CashTracker, ya esta casi lista</p>
            <p> Visita el siguiente enlace:</p>
            <a href="#">Confirmar cuenta</a>
            <p> e ingresa el codigo <b>${user.token}</b>
            `
        })
        console.log("Mensaje enviado ",email.messageId)
    }
    static sendPasswordResetToken = async (user : EmailType) =>{
        const email = await transport.sendMail({
            from: 'CashTrachr <admin@cashtrackr.com',
            to: user.email,
            subject: 'CashTrackr - Restablece tu password',
            html: `
            <p>Hola: ${user.name}, has solicitado reestablecer tu contraseña</p>
            <p> Visita el siguiente enlace:</p>
            <a href="#">Reestablecer Contraseña</a>
            <p> e ingresa el codigo <b>${user.token}</b>
            `
        })
        console.log("Mensaje enviado ",email.messageId)
    }
}

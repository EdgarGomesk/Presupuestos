import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const generateJWT = (id: string) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET_KEY, {
        expiresIn: '30d'
    })
    return token;
}
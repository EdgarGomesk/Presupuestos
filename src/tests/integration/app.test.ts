import request from 'supertest'
import server, { connectDB } from '../../server'
import { AuthController } from '../../controller/authController'
import User from '../../models/User'
import * as authUtils from '../../utils/auth'
import * as jwtUtils from '../../utils/jwt'
import exp from 'node:constants'

describe('Authentication -  Create Account', () => {
  it('should display validation errors when form is empty', async () => {
    const response = await request(server).post('/api/auth/create-account')
      .send({})
    const createAccountMock = jest.spyOn(AuthController, 'createAccount')

    expect(response.status).toBe(400)
    expect(response.status).not.toBe(200)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(3)

    expect(createAccountMock).not.toHaveBeenCalled()
  })

  it('should return 400 when the email is invalid', async () => {
    const response = await request(server).post('/api/auth/create-account')
      .send({
        name: "carlos",
        password: "123456789",
        email: "invalidEmail"
      })
    const createAccountMock = jest.spyOn(AuthController, 'createAccount')

    expect(response.status).toBe(400)
    expect(response.status).not.toBe(200)
    expect(response.body.errors[0].msg).toBe('E-mail no valido')
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(1)

    expect(createAccountMock).not.toHaveBeenCalled()
  })

  it('should return 400 status code when the password is less than 8 characters', async () => {
    const response = await request(server).post('/api/auth/create-account')
      .send({
        name: "carlos",
        password: "1234567",
        email: "email@email.com"
      })
    const createAccountMock = jest.spyOn(AuthController, 'createAccount')

    expect(response.status).toBe(400)
    expect(response.body.errors[0].msg).toBe('El password es muy corto mínimo 8 caracteres')
    expect(response.status).not.toBe(200)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(1)

    expect(createAccountMock).not.toHaveBeenCalled()
  })

  it('should register a new sucessfull', async () => {

    const userData = {
      name: "David Luis",
      password: "12345678",
      email: "email@email.com"
    }
    const response = await request(server).post('/api/auth/create-account')
      .send(userData)


    expect(response.status).toBe(201)

    expect(response.status).not.toBe(400)
    expect(response.body).not.toHaveProperty('errors')
  })

  it('should return 409 status code when is already register', async () => {

    const userData = {
      name: "David Luis",
      password: "12345678",
      email: "email@email.com"
    }
    const response = await request(server).post('/api/auth/create-account')
      .send(userData)


    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('El usuario ya existe')
    expect(response.status).not.toBe(400)
    expect(response.status).not.toBe(201)
    expect(response.body).not.toHaveProperty('errors')
  })
})

describe('Authentication - Account Confirmation with Token', () => {
  it('should display error if tooken is empty or token is not valid', async () => {
    const response = await request(server)
      .post('/api/auth/confirm-account')
      .send({
        token: "not_valid"
      });
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].msg).toBe('Token no válido')

  })

  it('should display error if tooken doesnt exists', async () => {
    const response = await request(server)
      .post('/api/auth/confirm-account')
      .send({
        token: "123456"
      });


    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Token no valido')
    expect(response.status).not.toBe(200)
  })

  it('should confirm account with a valid token', async () => {

    const token = globalThis.cashTrackrConfirmationToken
    const response = await request(server)
      .post('/api/auth/confirm-account')
      .send({
        token: token
      });


    expect(response.status).toBe(200)
    expect(response.body).toEqual('Cuenta confirmada correctamente')
    expect(response.status).not.toBe(401)
  })
})

describe('Authentication - login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display validation errors when the form is empty', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({})
    const loginMock = jest.spyOn(AuthController, 'login')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(2)

    expect(response.body.errors).not.toHaveLength(1)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('Should return 400 bad request when the email is invalid', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        "password": "12345678",
        "email": "not_valid"
      })

    const loginMock = jest.spyOn(AuthController, 'login')

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].msg).toBe('Debe ser un formato de email valido')

    expect(response.body.errors).not.toHaveLength(2)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('Should return a 400 error if the user is not found', async () => {
    const response = await request(server)
      .post('/api/auth/login')
      .send({
        "password": "12345678",
        "email": "user@test.com"
      })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Usuario no encontrado')

    expect(response.status).not.toBe(200)
  })

  it('Should return a 403 error if the user is not confirmed', async () => {

    (jest.spyOn(User, 'findOne') as jest.Mock)
      .mockResolvedValue({
        id: 1,
        confirmed: false,
        password: "hashedPassword",
        email: "user_not_confirmed@test.com"
      })

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        "password": "12345678",
        "email": "user_not_confirmed@test.com"
      })

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe("La cuenta no ha sido confirmada")

    expect(response.status).not.toBe(200)
  })

  it('Should return a 401 error if the password is incorrect', async () => {

    const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
      .mockResolvedValue({
        id: 1,
        confirmed: true,
        password: "hashedPassword"
      })

    const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        "password": "wrongPassword",
        "email": "test@test.com"
      })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('La contraseña es incorrecta')

    expect(response.status).not.toBe(200)
    expect(response.status).not.toBe(404)
    expect(response.status).not.toBe(403)

    expect(findOne).toHaveBeenCalledTimes(1)
    expect(checkPassword).toHaveBeenCalledTimes(1)
  })


  it('Should return a 401 error if the password is incorrect', async () => {

    const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
      .mockResolvedValue({
        id: 1,
        confirmed: true,
        password: "hashedPassword"
      })

    const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true)
    const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token')

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        "password": "correctPassword",
        "email": "test@test.com"
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual('jwt_token')

    expect(findOne).toHaveBeenCalled()
    expect(findOne).toHaveBeenCalledTimes(1)

    expect(checkPassword).toHaveBeenCalled()
    expect(checkPassword).toHaveBeenCalledTimes(1)
    expect(checkPassword).toHaveBeenCalledWith('correctPassword', 'hashedPassword')

    expect(generateJWT).toHaveBeenCalled()
    expect(generateJWT).toHaveBeenCalledTimes(1)
    expect(generateJWT).toHaveBeenCalledWith(1)
  })


})

let jwt: string
async function authenticateUser() {
  const response = await request(server)
    .post('/api/auth/login')
    .send({
      email: 'email@email.com',
      password: '12345678'
    })
  jwt = response.body
  expect(response.status).toBe(200)
}

describe('GET /api/bugets', () => {

  beforeAll(() => {
    jest.restoreAllMocks()
  })

  beforeAll(async () => {
    await authenticateUser()
  })

  it('should reject unauthenticated access to budgets without a jwt', async () => {
    const response = await request(server)
      .get('/api/budgets')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('No Autorizado')
  })


  it('Should allow authenticated access to budgets with a valid jwt', async () => {
    const response = await request(server)
        .get('/api/budgets')
        .auth(jwt, { type: 'bearer' })

    expect(response.body).toHaveLength(0)
    expect(response.status).not.toBe(401)
    expect(response.body.error).not.toBe('No Autorizado')
    })

  it('Should reject unauthenticated access to budgets without a valid jwt', async () => {
    const response = await request(server)
      .get('/api/budgets')
      .auth('not_valid', { type: 'bearer' })

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Token no valido')
  })

})


describe('POST /api/budgets', () => {

  beforeAll(async () => {
    await authenticateUser()
  })

  it('Should reject unauthenticated post request to budgets without a jwt', async () => {
    const response = await request(server)
      .post('/api/budgets')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('No Autorizado')
  })

  it('Should display validation when the form is submitted with invalid data', async () => {
    const response = await request(server)
      .post('/api/budgets')
      .auth(jwt, { type: 'bearer' })
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toHaveLength(4)
  })

  it('Should return thing', async () => {
    const response = await request(server)
      .post('/api/budgets')
      .auth(jwt, { type: 'bearer' })
      .send({
        name: "ss",
        amount: 30000
      })

    expect(response.status).toBe(201)
  })


})

describe('GET /api/budgets/:id', () => {
  beforeAll(async () => {
    await authenticateUser()
  })

  it('Should reject unauthenticated get request to budgets id without a jwt', async () => {
    const response = await request(server)
      .get('/api/budgets/1')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('No Autorizado')
  })

  it('Should 404 not found when a budget doesnt exists', async () => {
    const response = await request(server)
      .get('/api/budgets/3000')
      .auth(jwt, { type: 'bearer' })

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Presupuesto no encontrado')
    expect(response.status).not.toBe(400)
    expect(response.status).not.toBe(401)
  })

  it('Should return a single budget by id', async () => {
    const response = await request(server)
      .get('/api/budgets/1')
      .auth(jwt, { type: 'bearer' })

    expect(response.status).toBe(200)
    expect(response.status).not.toBe(400)
    expect(response.status).not.toBe(401)
    expect(response.status).not.toBe(404)
  })
})


describe('PUT /api/budgets/:id', () => {
  beforeAll(async () => {
    await authenticateUser()
  })

  it('Should reject unauthenticated put request to budget id without a jwt', async () => {
    const response = await request(server)
      .put('/api/budgets/1')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('No Autorizado')
  })
  it('Should display validation errors if the form is empty', async () => {
    const response = await request(server)
      .put('/api/budgets/1')
      .auth(jwt, {type: 'bearer'})
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeTruthy()
    expect(response.body.errors).toHaveLength(4)

  })


  it('Should update a budget by id and return a success message', async () => {
    const response = await request(server)
      .put('/api/budgets/1')
      .auth(jwt, {type: 'bearer'})
      .send({
        name: "actualizacion",
        amount: 3000
      })

    expect(response.status).toBe(200)
    expect(response.body).toBe('presupuesto actualizado correctamente')

  })
})

describe('DELETE /api/budgets/:id', () => {
  beforeAll(async () => {
      await authenticateUser()
  })

  it('Should reject unauthenticated delete request to budget id without a jwt', async () => {
      const response = await request(server)
          .delete('/api/budgets/1')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('No Autorizado')
  })

  it('Should return 404 not found when a budget doesnt exists', async () => {
      const response = await request(server)
          .delete('/api/budgets/600')
          .auth(jwt, { type: 'bearer' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Presupuesto no encontrado')
  })

  it('Should delete a budget and return a success message', async () => {
      const response = await request(server)
          .delete('/api/budgets/1')
          .auth(jwt, { type: 'bearer' })

      expect(response.status).toBe(200)
      expect(response.body).toBe('Presupuesto eliminado correctamente')
    })
})



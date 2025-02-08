import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'challengedario';

const USER = {
  id: '1',
  email: 'admin@test.com',
  password: 'admin123'
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Intento de login:', { email, password });

    if (email === USER.email && password === USER.password) {
      const token = jwt.sign(
        { 
          id: USER.id,
          email: USER.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      console.log('Login exitoso');
      res.json({
        id: USER.id,
        email: USER.email,
        token
      });
      return;
    }

    console.log('Credenciales inválidas');
    res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.setHeader('Authorization', '');

    console.log('Logout exitoso');
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error al cerrar la sesión' });
  }
};

const AuthController = {
  login,
  logout
};

export default AuthController;
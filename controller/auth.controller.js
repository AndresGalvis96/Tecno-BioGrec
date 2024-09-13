import jwt from "jsonwebtoken";
import { getUserByEmail, comparePassword } from "../models/user.model.js";
import { exports } from "../config/default.js";
import { getAllClients } from '../models/user.model.js';
import Request from "../models/requst.model.js";
import { getTotalPointsByUser } from '../models/requst.model.js';

export const getTotalPoints = async (req, res) => {
  const { userId } = req.params;

  try {
    const totalPoints = await getTotalPointsByUser(userId);

    res.status(200).json({ userId, totalPoints });
  } catch (error) {
    console.error('Error al obtener los puntos totales del usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const listAllClients = async (req, res) => {
  try {
    const clients = await getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error al listar todos los clientes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
export const login = async (req, res) => {
  const { email, password, secretKey } = req.body; // Añadir secretKey aquí

  try {
    res.clearCookie('token');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "El campo 'email' y 'password' son obligatorios" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, msg: "Credenciales email inválidas" });
    }

    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Credenciales password inválidas" });
    }

    // Determinar el tipo de usuario basado en el campo secreto
    const userType = secretKey === 'admin' ? 'admin' : user.type;
    const token = jwt.sign({ userId: user._id, type: userType }, exports.secret, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true });

    return res.redirect(`/bienvenido`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, lastName, email, password, address, type } = req.body;
    
    if (!name || !lastName || !email || !password || !address) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const userType = type || "cliente"; // Si no se especifica el tipo, se asigna "cliente" por defecto

    const newUser = await createUser({ name, lastName, email, password, address, type: userType });

    const token = jwt.sign({ userId: newUser._id }, exports.secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    
    res.redirect(`/bienvenido`); // Redirige a la página de bienvenida
  } catch (error) {
    console.error("Error al registrar el usuario", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};
export const logout = (req, res) => {
  try {

    res.clearCookie('token');
    
    res.redirect('/');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
  }
};
export const createRequest = async (userId, requestData) => {
  try {
    const newRequest = new Request({
      userId,
      title: requestData.title,
      detail: requestData.detail,
      location: requestData.location,
      status: requestData.status || 'pendiente',
      rating: requestData.rating || null,
    });
    await newRequest.save();
    return newRequest;
  } catch (error) {
    console.error("Error al crear la solicitud en la base de datos", error);
    throw new Error("Error al crear la solicitud en la base de datos");
  }
};

export const listAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('userId', 'name email');
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error al listar todas las solicitudes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
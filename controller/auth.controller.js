import jwt from "jsonwebtoken";
import { getUserByEmail, comparePassword, createUser } from "../models/user.model.js"; 
import { exports } from "../config/default.js";
import { getAllClients } from '../models/user.model.js';
import Request from "../models/requst.model.js";
import { getTotalPointsByUser } from '../models/requst.model.js';

const phoneRegex = /^\d{10}$/; 
const docRegex = /^\d{7,10}$/;

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
  const { email, password, secretKey } = req.body; 
  try {
      res.clearCookie('token');
      if (!email || !password) {
          return res.status(400).json({ success: false, message: "El campo 'email' y 'password' son obligatorios" });
      }
      const user = await getUserByEmail(email);
      if (!user) {
          return res.status(401).json({ success: false, message: "Credenciales email inválidas" });
      }
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
          return res.status(401).json({ success: false, message: "Credenciales password inválidas" });
      }
      
      const userType = secretKey === 'admin' ? 'admin' : user.type;
      const token = jwt.sign({ userId: user._id, type: userType }, exports.secret, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      
      return res.json({ success: true, message: "Inicio de sesión exitoso" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};


export const signup = async (req, res) => {
  try {
    const { name, lastName, email, password, address, phone, doc, type, location } = req.body;
    let lat, lon;
    if (!name || !lastName || !email || !password || !address || !phone || !doc || !location) {
      return res.status(400).json({ success: false, message: "Todos los campos, incluyendo 'phone' y 'doc', son obligatorios" });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "El número de teléfono debe tener un formato válido (10 dígitos)" });
    }

    if (!docRegex.test(doc)) {
      return res.status(400).json({ success: false, message: "El documento debe tener entre 7 y 10 dígitos" });
    }
else{
  const userType = type || "cliente"; 
 
    const newUser = await createUser({ name, lastName, email, password, address, phone, doc, type: userType, location });


    const token = jwt.sign({ userId: newUser._id }, exports.secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    
    res.redirect(`/bienvenido`); 
}

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
  console.log("ceate controller",requestData);
  
  try {
    const newRequest = new Request({
      userId,
      title: requestData.title,
      detail: requestData.detail,
      location: requestData.location,
      status: requestData.status || 'pendiente',
      rating: requestData.rating || null,
      containerId: requestData.containerId || null
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

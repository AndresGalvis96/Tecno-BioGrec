import { Router } from "express";
import { createUser } from "../models/user.model.js";
import { signup } from "../controller/auth.controller.js";
import { login, logout } from "../controller/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getUserById, addRequestToUser, updateUser } from "../models/user.model.js";
import { createRequest } from "../models/requst.model.js";
import Request from "../models/requst.model.js";
import { getTotalPoints } from "../controller/auth.controller.js";
const router = Router();



router.post("/signup", signup);
router.get('/points/:userId', getTotalPoints);

router.post("/login", login);
router.post('/logout', logout);

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos del usuario", error: error.message });
  }
});
router.post('/requests', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { title, detail, location, containerId } = req.body;  
    const newRequest = await createRequest(userId, { title, detail, location, containerId }); 
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la solicitud.", error: error.message });
  }
});


router.get('/requests/all', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userRequests = await Request.find({ userId });
    if (!userRequests || userRequests.length === 0) {
      return res.status(404).json({ message: 'No se hallaron solicitudes de este usuario' });
    }
    res.status(200).json(userRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes del usuario', error: error.message });
  }
});


router.put("/me", verifyToken, async (req, res) => {
  const { name, lastName, doc, phone, address, location, type } = req.body;
  
  if (!name && !lastName && !address && !location && !doc && !phone && !type)  {
    return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
  }

  try {
    const userId = req.user.userId;
    const updateData = {};

    if (name) updateData.name = name;
    if (lastName) updateData.lastName = lastName;
    if (doc) updateData.doc= doc;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (location) updateData.location = location;
    if (type) updateData.type = type;

    const updatedUser = await updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar los datos del usuario', error: error.message });
  }
});

export default router;

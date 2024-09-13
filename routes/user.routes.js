import { Router } from 'express';
import { getUserByEmail } from '../models/user.model.js';
import { getAllClients } from '../models/user.model.js';

const router = Router();

router.get('/get', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar usuario', error: error.message });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

router.get('/clients', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todos los clientes', error: error.message });
  }
});

router.post('/request', async (req, res) => {
  const { userId, title, detail } = req.body;
  
  if (!userId || !title || !detail) {
    return res.status(400).json({ message: 'Datos de solicitud incompletos' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const request = { title, detail };
    const updatedUser = await addRequestToUser(userId, request);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar solicitud', error: error.message });
  }
});


router.get('/requests/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user.requests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes del usuario', error: error.message });
  }
});

export default router;

import { getUserById, getClientLocation } from '../models/user.model.js';
import { getRequestById } from '../models/requst.model.js';
import { getAllRequests, getRequestsByClientId } from '../models/requst.model.js';
import User from '../models/user.model.js';
import { finishRequestById } from '../models/requst.model.js';

export const listAllClients = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; 
  try {
    const clients = await User.find({ type: 'cliente' })
                              .limit(limit * 1)
                              .skip((page - 1) * limit)
                              .exec();
    const count = await User.countDocuments({ type: 'client' });

    res.status(200).json({
      clients,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error al listar los clientes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const findClientById = async (req, res) => {
  const { clientId } = req.params;
  try {
    const client = await getUserById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error al buscar el cliente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const listAllRequests = async (req, res) => {
  try {
    const requests = await getAllRequests();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error al listar las solicitudes:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

export const listRequestsByClientId = async (req, res) => {
  const { clientId } = req.params;
  console.log(clientId, "id...");
  
  try {
    const requests = await getRequestsByClientId(clientId);
    if (!requests) {
      return res.status(404).json({ success: false, message: 'No se encontraron solicitudes para este cliente' });
    }
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error al listar las solicitudes del cliente:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
export const findRequestById = async (req, res) => {
  const { requestId } = req.params;
  try {
    const request = await getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const clientLocation = await getClientLocation(request.userId);
    res.status(200).json({
      ...request._doc,
      location: clientLocation // Agrega la ubicación al objeto de respuesta
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles de la solicitud', error: error.message });
  }

};
export const finishById = async (req, res) => {
  const { requestId } = req.params;
  const { rating } = req.body;
  
  try {

    const finishedRequest = await finishRequestById(requestId, rating);
    
    if (!finishedRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada o no pudo ser finalizada' });
    }

    res.status(200).json({ message: 'Solicitud finalizada exitosamente', request: finishedRequest });
  } catch (error) {
    console.error('Error al finalizar la solicitud:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};


export const getLocation = async (req, res) =>{
  try {
    const requestId = req.params.id;
    const request = await getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const clientLocation = await getClientLocation(request.userId);
    res.status(200).json({
      ...request._doc,
      location: clientLocation // Agrega la ubicación al objeto de respuesta
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles de la solicitud', error: error.message });
  }
}
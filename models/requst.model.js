import mongoose from 'mongoose';
import User from './user.model.js';
const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  detail: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: { type: String, default: 'pendiente' }, 
  rating: { type: Number, min: 1, max: 100 }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

export const getAllRequests = async () => {
  try {
    const requests = await Request.find().populate('userId', 'name email');
    
    return requests;
  } catch (error) {
    console.error("Error al obtener todas las solicitudes de la base de datos", error);
    throw new Error("Error al obtener todas las solicitudes de la base de datos");
  }
};
export const getTotalPointsByUser = async (userId) => {
  try {
    const requests = await Request.find({ userId });

    const totalPoints = requests.reduce((sum, request) => {
      return sum + (request.rating || 0);
    }, 0);

    return totalPoints;
  } catch (error) {
    console.error("Error al obtener las solicitudes del usuario", error);
    throw new Error("Error al obtener las solicitudes del usuario");
  }
};

export const getRequestsByClientId = async (userId) => {
  try {
    // Buscar solicitudes que estén asociadas al userId proporcionado
    const requests = await Request.find({ userId: userId });
    
    // Verificar si se encontraron solicitudes
    if (requests.length === 0) {
      console.log("No se encontraron solicitudes para el usuario con ID:", userId);
      return null;
    }

    console.log("Solicitudes encontradas:", requests);
    return requests;
  } catch (error) {
    console.error("Error al buscar solicitudes por ID de cliente en la base de datos", error);
    throw new Error("Error al buscar solicitudes por ID de cliente en la base de datos");
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
export const getRequestById = async (requestId) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      console.log("ID de solicitud inválido");
      return null;
    }

    const request = await Request.findById(requestId).populate('userId', 'name email');
    
    if (!request) {
      console.log("Solicitud no encontrada");
      return null;
    }

    return request;
  } catch (error) {
    console.error("Error al obtener la solicitud por ID en la base de datos", error);
    throw new Error("Error al obtener la solicitud por ID en la base de datos");
  }
};
export const finishRequestById = async (requestId, rating) => {

  try {

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'terminado', rating: rating },
      { new: true }
    );

 
    if (!request) {
      console.log("Solicitud no encontrada");
      return null;
    }

    return request;
  } catch (error) {
    console.error("Error al finalizar la solicitud en la base de datos", error);
    throw new Error("Error al finalizar la solicitud en la base de datos");
  }
};
export default Request;

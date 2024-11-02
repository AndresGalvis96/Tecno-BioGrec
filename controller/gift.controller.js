import { Premio } from '../models/gift.model.js';
import { createRequest } from './auth.controller.js';

export const createPremio = async (req, res) => {
    try {
        const { tipo, descripcion, disponibilidad, cantidad, puntosNecesarios, image } = req.body;

        const nuevoPremio = new Premio({
            tipo,
            descripcion,
            disponibilidad,
            cantidad,
            puntosNecesarios,
            image
        });

        await nuevoPremio.save();
        res.status(201).json({ success: true, message: 'Premio creado exitosamente', premio: nuevoPremio });
    } catch (error) {
        console.error('Error al crear el premio:', error);
        res.status(500).json({ success: false, message: 'Error al crear el premio' });
    }
};

export const updatePremio = async (req, res) => {
    try {
        const premioId = req.params.id;
        const updates = req.body;

        const premioActualizado = await Premio.findByIdAndUpdate(premioId, updates, { new: true });

        if (!premioActualizado) {
            return res.status(404).json({ success: false, message: 'Premio no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Premio actualizado exitosamente', premio: premioActualizado });
    } catch (error) {
        console.error('Error al actualizar el premio:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el premio' });
    }
};

export const deletePremio = async (req, res) => {
    try {
        const premioId = req.params.id;

        const premioEliminado = await Premio.findByIdAndDelete(premioId);

        if (!premioEliminado) {
            return res.status(404).json({ success: false, message: 'Premio no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Premio eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el premio:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el premio' });
    }
};

export const getPremioById = async (req, res) => {
    try {
        const premioId = req.params.id;

        const premio = await Premio.findById(premioId);

        if (!premio) {
            return res.status(404).json({ success: false, message: 'Premio no encontrado' });
        }

        res.status(200).json({ success: true, premio });
    } catch (error) {
        console.error('Error al obtener el premio:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el premio' });
    }
};

export const getAllPremios = async (req, res) => {
    try {
        const premios = await Premio.find();
        res.status(200).json(premios);  
    } catch (error) {
        console.error('Error al listar los premios:', error);
        res.status(500).json({ success: false, message: 'Error al listar los premios' });
    }
};
export const redeemPremio = async (req, res) => {
    try {
        const premioId = req.params.id;
        const userId = req.body.userId; 
        const premio = await Premio.findById(premioId);
        if (!premio) {
            return res.status(404).json({ success: false, message: 'Premio no encontrado' });
        }

        if (premio.cantidad < 1) {
            return res.status(400).json({ success: false, message: 'Este premio no está disponible' });
        }

        premio.cantidad -= 1;

        if (premio.cantidad < 1) {
            premio.disponibilidad = 'no disponible';
        }

        await premio.save();

        const contacto = req.body.contacto;

        const requestData = {
            title: '¡PREMIO RECLAMADO!',
            detail: `Premio: ${premio.tipo}. Número de contacto: ${contacto}`,
            location: premio.location, 
            status: 'pendiente',
            containerId: premioId 
        };

        const newRequest = await createRequest(userId, requestData);

        res.status(200).json({ success: true, message: 'Premio redimido y solicitud creada exitosamente', premio, request: newRequest });
    } catch (error) {
        console.error('Error al redimir el premio:', error);
        res.status(500).json({ success: false, message: 'Error al redimir el premio' });
    }
};


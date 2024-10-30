import Container from '../models/Container.model.js';

export const createContainer = async (req, res) => {
    const { nombre, type, size, price, availability, location, description, image } = req.body;

    try {
        const container = new Container({ nombre, type, size, price, availability, location, description, image });
        await container.save();
        res.status(201).json({ success: true, message: 'Contenedor creado exitosamente', container });
    } catch (error) {
        console.error('Error al crear el contenedor:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

export const getAllContainers = async (req, res) => {
    try {
        const containers = await Container.find();
        res.status(200).json(containers);
    } catch (error) {
        console.error('Error al obtener los contenedores:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

export const getContainerById = async (req, res) => {
    try {
        const container = await Container.findById(req.params.id);
        if (!container) {
            return res.status(404).json({ success: false, message: 'Contenedor no encontrado' });
        }
        res.status(200).json(container);
    } catch (error) {
        console.error('Error al obtener el contenedor:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
export const updateContainer = async (req, res) => {
    try {
        const container = await Container.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!container) {
            return res.status(404).json({ success: false, message: 'Contenedor no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Contenedor actualizado exitosamente', container });
    } catch (error) {
        console.error('Error al actualizar el contenedor:', error);
        res.status(400).json({ success: false, message: 'Error al actualizar el contenedor' });
    }
};

export const deleteContainer = async (req, res) => {
    try {
        const container = await Container.findByIdAndDelete(req.params.id);
        if (!container) {
            return res.status(404).json({ success: false, message: 'Contenedor no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Contenedor eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el contenedor:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

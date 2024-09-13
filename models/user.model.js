import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 9;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: String, required: true, default: "cliente" },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  requests: [{ 
    title: { type: String, required: true },
    detail: { type: String, required: true },
    estado: { type: String, default: "pendiente" },
    calificacion: { type: Number, default: null },
    date: { type: Date, default: Date.now }
  }]
});


const User = mongoose.model('User', UserSchema);

export const createUser = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const user = new User({
      ...userData,
      password: hashedPassword,
      location: userData.location || { latitude: null, longitude: null }
    });
    await user.save();
    return user;
  } catch (error) {
    console.error("Error al crear usuario en la base de datos", error);
    throw new Error("Error al crear usuario en la base de datos");
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Usuario inexistente");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error al buscar usuario por correo electrónico en la base de datos", error);
    throw new Error("Error al buscar usuario por correo electrónico en la base de datos");
  }
};

export const getUserById = async (userId) => {

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("Usuario inexistente");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error al buscar usuario por ID en la base de datos", error);
    throw new Error("Error al buscar usuario por ID en la base de datos");
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });
    return user;
  } catch (error) {
    console.error("Error al actualizar usuario en la base de datos", error);
    throw new Error("Error al actualizar usuario en la base de datos");
  }
};
export const addRequestToUser = async (userId, requestData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("Usuario inexistente");
      return null;
    }

    const newRequest = {
      title: requestData.title,
      detail: requestData.detail,
      estado: requestData.estado || "pendiente",
      calificacion: requestData.calificacion || null,
    };
    
    user.requests.push(newRequest);
    await user.save();
    return user;
  } catch (error) {
    console.error("Error al agregar solicitud al usuario en la base de datos", error);
    throw new Error("Error al agregar solicitud al usuario en la base de datos");
  }
};


export const deleteUser = async (userId) => {
  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error("Error al eliminar usuario de la base de datos", error);
    throw new Error("Error al eliminar usuario de la base de datos");
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error al comparar contraseñas", error);
    throw new Error("Error al comparar contraseñas");
  }
};
export const getAllClients = async () => {
  try {
    console.log("getAllclients");
    
    const clients = await User.find({ type: 'cliente' }).select('-password'); // Excluye el campo de contraseña
    return clients;
  } catch (error) {
    console.error("Error al obtener todos los clientes de la base de datos", error);
    throw new Error("Error al obtener todos los clientes de la base de datos");
  }
};
export const getClientLocation = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.location; 
  } catch (error) {
    console.error("Error al obtener la ubicación del cliente:", error);
    throw new Error("Error al obtener la ubicación del cliente");
  }
};
export default mongoose.model('User', UserSchema);

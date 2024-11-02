import mongoose from 'mongoose';

const PremioSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    }, 
    image: {type: String,},
    disponibilidad: {
        type: Boolean,
        default: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    puntosNecesarios: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

export const Premio = mongoose.model('Premio', PremioSchema);

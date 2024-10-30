import mongoose from 'mongoose';

const containerSchema = new mongoose.Schema({
    nombre: {type: String,required: true,},
    type: { type: String, enum: ['venta', 'alquiler'],required: true,},
    size: {type: String,required: true,},
    price: {type: Number,required: true,},
    availability: {type: Boolean, default: true,},
    location: {type: String,required: true,},
    description: {type: String, },
    image: {type: String,},
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

containerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Container = mongoose.model('Container', containerSchema);

export default Container;

import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  puntos: { type: Number, required: true }
});

const Product = mongoose.model('Product', ProductSchema);

export const createProduct = async (productData) => {
  try {
    const newProduct = new Product({
      nombre: productData.nombre,
      puntos: productData.puntos
    });
    
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error("Error al crear el producto en la base de datos", error);
    throw new Error("Error al crear el producto en la base de datos");
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      { nombre: productData.nombre, puntos: productData.puntos },
      { new: true } 
    );
    return updatedProduct;
  } catch (error) {
    console.error("Error al actualizar el producto en la base de datos", error);
    throw new Error("Error al actualizar el producto en la base de datos");
  }
};
export const deleteProduct = async (productId) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      throw new Error("Producto no encontrado");
    }
    return deletedProduct;
  } catch (error) {
    console.error("Error al eliminar el producto de la base de datos", error);
    throw new Error("Error al eliminar el producto de la base de datos");
  }
};
export const getAllProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    console.error("Error al obtener los productos de la base de datos", error);
    throw new Error("Error al obtener los productos de la base de datos");
  }
};

export default Product;

import { createProduct, updateProduct, getAllProducts, deleteProduct } from '../models/product.model.js'; 

export const createNewProduct = async (req, res) => {
  const { nombre, puntos } = req.body;
console.log(req.body);

  if (!nombre || puntos === undefined) {
    return res.status(400).json({ success: false, message: "El campo 'nombre' y 'puntos' son obligatorios" });
  }
  try {
    const newProduct = await createProduct({ nombre, puntos });
    return res.status(201).json({ success: true, message: 'Producto creado exitosamente', product: newProduct });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

export const editProduct = async (req, res) => {
  const { productId } = req.params; 
  const { nombre, puntos } = req.body;

  if (puntos === undefined) {
    return res.status(400).json({ success: false, message: "El campo 'nombre' y 'puntos' son obligatorios" });
  }

  try {

    const updatedProduct = await updateProduct(productId, { nombre, puntos });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    return res.status(200).json({ success: true, message: 'Producto actualizado exitosamente', product: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};
export const deleteProductController = async (req, res) => {
  const { productId } = req.params; 

  try {
    const deletedProduct = await deleteProduct(productId);
    res.status(200).json({
      message: 'Producto eliminado exitosamente',
      product: deletedProduct
    });
  } catch (error) {
    console.error("Error en el controlador al eliminar el producto:", error);
    res.status(500).json({
      message: error.message || 'Error al eliminar el producto'
    });
  }
};
export const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProducts(); 
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

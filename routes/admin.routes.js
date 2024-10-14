import express from 'express';
import { listAllClients,findRequestById, findClientById, listAllRequests, listRequestsByClientId, getLocation, finishById } from '../controller/admin.controller.js';
import { createNewProduct, editProduct, getAllProductsController, deleteProductController } from '../controller/product.controller.js';
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get('/clients', listAllClients);
router.get('/clients/:clientId',verifyToken, findClientById);
router.get('/request/:requestId',verifyToken, findRequestById);
router.get('/requests/all/clients',verifyToken, listAllRequests);
router.get('/clients/:clientId/requests',verifyToken, listRequestsByClientId);
router.get('/client/location/:clientId',verifyToken,  getLocation)
router.post('/request/finish/:requestId',verifyToken, finishById);
router.post('/create/product',verifyToken, createNewProduct);
router.get('/products',verifyToken, getAllProductsController);
router.put('/update/product/:productId',verifyToken, editProduct);
router.delete('/delete/product/:productId',verifyToken, deleteProductController);

export default router;

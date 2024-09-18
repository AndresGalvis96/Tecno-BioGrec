import express from 'express';
import { listAllClients,findRequestById, findClientById, listAllRequests, listRequestsByClientId, getLocation, finishById } from '../controller/admin.controller.js';
import { createNewProduct, editProduct, getAllProductsController } from '../controller/product.controller.js';

const router = express.Router();

router.get('/clients', listAllClients);
router.get('/clients/:clientId', findClientById);
router.get('/request/:requestId', findRequestById);
router.get('/requests/all/clients', listAllRequests);
router.get('/clients/:clientId/requests', listRequestsByClientId);
router.get('/client/location/:clientId',  getLocation)
router.post('/request/finish/:requestId', finishById);
router.post('/create/product', createNewProduct);
router.get('/products', getAllProductsController);
router.put('/update/product/:productId', editProduct);

export default router;

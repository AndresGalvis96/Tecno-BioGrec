import express from 'express';
import { listAllClients,findRequestById, findClientById, listAllRequests, listRequestsByClientId, getLocation, finishById } from '../controller/admin.controller.js';


const router = express.Router();

// Rutas para el administrador
router.get('/clients', listAllClients);
router.get('/clients/:clientId', findClientById);
router.get('/request/:requestId', findRequestById);
router.get('/requests/all/clients', listAllRequests);
router.get('/clients/:clientId/requests', listRequestsByClientId);
router.get('/client/location/:clientId',  getLocation)
router.post('/request/finish/:requestId', finishById);

export default router;

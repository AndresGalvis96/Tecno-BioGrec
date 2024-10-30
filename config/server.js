import express from "express";
import bodyParser from "body-parser"
import cookieParser from 'cookie-parser';
import router from "../routes/index.routes.js";
import jwt from 'jsonwebtoken';
import middle from '../middlewares/index.middleware.js'
import { exports } from "./default.js";
import { login } from '../controller/auth.controller.js';
import mongoose from 'mongoose';
import ngrok from 'ngrok';
export default class Server{
   

    async conecctionDb() {
        try {
            await mongoose.connect(exports.mongo, {
            useNewUrlParser: true,
             useUnifiedTopology: true,
            });
            console.log('Conexión a MongoDB exitosa');
        } catch (error) {
            console.error('Error al conectar a MongoDB', error);
            process.exit(1);
        }
    }
    constructor(){

        this.app=express();
        this.port= exports.port
    }
    

    middleware(){
        this.app.use(bodyParser.json());
        this.app.use(middle);
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.set('view engine', 'ejs');
        this.app.use(express.static('views'));
   
    }
    
    routes(){

        const verificarToken = (req, res, next) => {
            const token = req.cookies.token;

            if (!token) {
                return res.redirect('/');
            }

            try {
                const decoded = jwt.verify(token, exports.secret);
                req.token = token;
                next();
            } catch (error) {
                console.error('Error de autenticación:', error);
                return res.status(401).send('Acceso no autorizado');
            }
        };
        this.app.use(express.urlencoded({ extended: true }));


        this.app.post('/auth/login', login);

       this.app.use("/img",express.static('img'));
        this.app.use(router);

   
        this.app.get('/', (req, res) => {
            res.render('index', { title: 'Página de inicio' });
        });

        this.app.get('/bienvenido', (req, res) => {

            const token = req.cookies.token;

            if (!token) {
                return res.redirect('/');
            }

            try {

                const decoded = jwt.verify(token, exports.secret);

                res.render('bienvenido', { title: '¡Bienvenido!', token: token });
            } catch (error) {
                console.error('Error de autenticación:', error);
                return res.status(401).send('Acceso no autorizado');
            }
        });

    }

    runserver(){
        this.app.listen(this.port,()=>{
            console.log("Corriendo en puerto: ", this.port);
            //try {
               ////console.log(`Túnel HTTPS establecido en: ${url}`);
            //} catch (err) {
                 //console.error('Error al conectar Ngrok:', err);
           //  }
        })
    }

    load(){
        this.conecctionDb();
        this.middleware();
        this.routes();
        this.runserver();
    }
}
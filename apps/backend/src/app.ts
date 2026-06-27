import 'reflect-metadata';
import express  from "express";
import {orm, syncSchema} from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/mysql';

const app = express();

app.use(express.json());

//luego de los middlewares base
app.use((req, res, next) => {
   RequestContext.create(orm.em, next)
})
//antes de las rutas y middlewares de negocio

await syncSchema();  //no usar en produccion

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})
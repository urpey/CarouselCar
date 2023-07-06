import { client } from "./db"
import express from 'express';
import { io } from "./server"


export const ioRoute = express.Router();

io.emit("dfd",{})
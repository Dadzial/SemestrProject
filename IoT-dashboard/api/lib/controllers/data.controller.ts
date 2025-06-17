import Controller from "../interfaces/controller";
import {Response, Request,Router,NextFunction} from "express";
import path from "path";
import {checkIdParam} from "../middlewares/deviceIdparam.middleware";
import DataService from "../modules/services/data.service";
import DataModel from "../modules/schemas/data.schema";
import Joi from "joi";
import {IData} from "../modules/models/data.model";
import {auth} from "../middlewares/auth.middleware";
import {Server} from "socket.io";
import axios from "axios";
import cron from "node-cron";

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
    public path = "/api/data"
    public router = Router()
    public espEndpoint= "http://192.168.2.191/data"
    public espEndpointTwo="http://192.168.2.191/ds18b20/temp"
    private io: Server;

    constructor(private dataService: DataService, io: Server) {
        this.io = io;
        this.intitailizeRoutes();
        this.initializeWebSocketHandler();
    }

    private intitailizeRoutes( ) {
        this.router.get(`${this.path}/esp-data`,this.getStoredDataFromEsp);
        this.router.get(`${this.path}/esp-temp`,this.getStoredTempFromEsp);
        this.router.post(`${this.path}/fetch-and-save`, this.fetchAndSaveEspData);
        this.router.post(`${this.path}/fetch-temp`,this.fetchAndSaveEspDataTwo);
        this.router.get(`${this.path}/latest`,auth, this.getLatestReadingsFromAllDevices);
        this.router.post(`${this.path}/add/:id`,auth,checkIdParam, this.addData );
        this.router.get(`${this.path}/get/:id` ,auth,checkIdParam,this.getelement )
        this.router.get(`${this.path}/max` ,auth,checkIdParam,this.getMaxElement,)
        this.router.get(`${this.path}/latest/:count`,auth,checkIdParam,this.getlastNElements)
        this.router.delete(`${this.path}/delete/all`,auth,checkIdParam,this.deleteAll)
        this.router.delete(`${this.path}/delete/:id`,auth,checkIdParam,this.deleteElement)
        this.router.get(`${this.path}/:id/:num`,auth, checkIdParam, this.getPeriodData);
        this.router.delete(`${this.path}/clear/fetch-save`, this.clearFetchSaveData);
        this.router.delete(`${this.path}/clear/fetch-temp`, this.clearFetchSaveDataTwo);
    }


    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;


        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required()
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number().integer().positive().valid(parseInt(id, 10)).required()
        });

        try{
            const validatedData = await schema.validateAsync({ air, deviceId: parseInt(id, 10) });
            const readingDate : IData = {
                temperature: validatedData.air[0].value,
                humidity: validatedData.air[1].value,
                deviceId: validatedData.deviceId,
            };
            await this.dataService.createData(readingDate);
            response.status(200).json(readingDate);

        }catch (error) {
            console.error(`Validation error: ${error.message}`);
            response.status(400).json({ error: "Validation error"});
        }
    };

    private getelement = async (request: Request, response: Response) => {
        const index = parseInt(request.params.id);
        response.status(200).send(testArr[index]);
    }

    private getMaxElement = async (request: Request, response: Response) => {
        let max = testArr[0];
        for (let i = 1; i < testArr.length; i++) {
            if (testArr[i] > max) {
                max = testArr[i];
            }
        }
        response.status(200).send(max);
    }

    private getlastNElements = async (request: Request, response: Response) => {
        const count = parseInt(request.params.count);
        response.status(200).send(testArr.slice(-count));
    }

    private deleteAll = async (request: Request, response: Response) => {
        testArr = [];
        response.status(200).send({ message: "Data deleted successfully", updatedArray: testArr });
    }

    private deleteElement = async (request: Request, response: Response) => {
        const index = parseInt(request.params.id);
        testArr.splice(index, 1);
        response.status(200).send({ message: "Data deleted successfully", updatedArray: testArr });
    }

    private getLatestReadingsFromAllDevices = async (req: Request, res: Response) => {
        try {
            const data = await this.dataService.getAllNewest();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    private getPeriodData = async (req: Request, res: Response) => {
        const { id, num } = req.params;
        const count = parseInt(num || "1");

        try {
            const data = await DataModel.find({ deviceId: id }, { __v: 0, _id: 0 })
                .limit(count)
                .sort({ $natural: -1 });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    public getStoredDataFromEsp = async (req: Request, res: Response) => {
        try {
            const data = await this.getEspData();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public getStoredTempFromEsp = async (req: Request, res: Response) => {
        try {
            const data = await this.getEspDataTwo();
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async getEspData() {
        const response = await axios.get(this.espEndpoint);
        return response.data;
    }

    public async getEspDataTwo() {
        const response = await axios.get(this.espEndpointTwo);
        return response.data;
    }

    private initializeWebSocketHandler() {
        this.io.on('connection', (socket) => {
            console.log('A user connected');

            const interval = setInterval(async () => {
                try {
                    const dataFromDHT = await this.getEspData();
                    const dataFromD18b20 = await this.getEspDataTwo();
                    socket.emit('dataFromDHT', dataFromDHT);
                    socket.emit('dataFromD18b20', dataFromD18b20);
                } catch (error: any) {
                    console.error(`Error fetching data from ESP: ${error.message}`);
                }
            }, 3000);

            socket.on('disconnect', () => {
                console.log('A user disconnected');
                clearInterval(interval);
            });
        });
    }

    private fetchAndSaveEspData = async (req: Request, res: Response) => {
        try {
            const espData = await this.getEspData();

            const schema = Joi.object({
                temperature: Joi.number().required(),
                humidity: Joi.number().required(),
                deviceId: Joi.string().required()
            });

            const validatedData = await schema.validateAsync(espData);

            const readingDate: IData = {
                temperature: validatedData.temperature,
                humidity: validatedData.humidity,
                deviceId: validatedData.deviceId,
                createdAt: new Date()
            };

            await this.dataService.createData(readingDate);

            const allData = await DataModel.find({ deviceId: validatedData.deviceId }).sort({ createdAt: -1 });

            res.status(200).json({ message: 'Dane z ESP zostały zapisane.', data: allData });
        } catch (error: any) {
            console.error(`Error in fetchAndSaveEspData: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    };

    private clearFetchSaveData = async (req: Request, res: Response) => {
        try {
            await DataModel.deleteMany({});
            res.status(200).json({ message: 'All fetch and save data has been cleared successfully' });
        } catch (error) {
            console.error('Error clearing fetch and save data:', error);
            res.status(500).json({ error: 'Failed to clear fetch and save data' });
        }
    }

    private fetchAndSaveEspDataTwo = async (req: Request, res: Response) => {
        try {
            const espDataTwo = await this.getEspDataTwo();
            const schema = Joi.object({
                temperature: Joi.number().required(),
                deviceId: Joi.string().required()
            });
            const validatedData = await schema.validateAsync(espDataTwo);
            const readingDate: IData = {
                temperature: validatedData.temperature,
                deviceId: validatedData.deviceId,
                createdAt: new Date()
            };
            await this.dataService.createData(readingDate);
            const allData = await DataModel.find({ deviceId: validatedData.deviceId }).sort({ createdAt: -1 });
            res.status(200).json({ message: 'Dane z ESP zostały zapisane.', data: allData });
        } catch (error: any) {
            console.error(`Error in fetchAndSaveEspDataTwo: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    };

    private clearFetchSaveDataTwo = async (req: Request, res: Response) => {
        try {
            await DataModel.deleteMany({});
            res.status(200).json({ message: 'All fetch and save data has been cleared successfully' });
        } catch (error) {
            console.error('Error clearing fetch and save data:', error);
            res.status(500).json({ error: 'Failed to clear fetch and save data' });
        }
    }


}

export default DataController
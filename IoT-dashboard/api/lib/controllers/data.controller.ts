import Controller from "../interfaces/controller";
import {Response, Request,Router,NextFunction} from "express";
import path from "path";
import {checkIdParam} from "../middlewares/deviceIdparam.middleware";
import DataService from "../modules/services/data.service";
import DataModel from "../modules/schemas/data.schema";
import Joi from "joi";
import {IData} from "../modules/models/data.model";

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
    public path = "/api/data"
    public router = Router()
    private dataService = new DataService();

    constructor() {
        this.intitailizeRoutes();
    }

    private intitailizeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.post(`${this.path}/add/:id`,checkIdParam, this.addData );
        this.router.get(`${this.path}/get/:id` ,checkIdParam,this.getelement )
        this.router.get(`${this.path}/max` ,checkIdParam,this.getMaxElement,)
        this.router.get(`${this.path}/latest/:count`,checkIdParam,this.getlastNElements)
        this.router.delete(`${this.path}/delete/all`,checkIdParam,this.deleteAll)
        this.router.delete(`${this.path}/delete/:id`,checkIdParam,this.deleteElement)
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getPeriodData);
        this.router.delete(`${this.path}/all`, this.cleanAllDevices);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.cleanDeviceData);

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
                pressure: validatedData.air[1].value,
                humidity: validatedData.air[2].value,
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

    private getAllDeviceData = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const data = await this.dataService.query(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
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

    private cleanDeviceData = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await this.dataService.deleteData(id);
            res.status(200).json({ message: "Dane urządzenia usunięte." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    private cleanAllDevices = async (req: Request, res: Response) => {
        try {
            for (let i = 0; i < 17; i++) {
                await this.dataService.deleteData(i.toString());
            }
            res.status(200).json({ message: "Wszystkie dane zostały usunięte." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


}

export default DataController
import Controller from "../interfaces/controller";
import {Response, Request} from "express";
import path from "path";
import {Router} from "express";
import DataService from "../modules/services/data.service";

class IndexController implements Controller {
    public path = "/";
    public router = Router();

    constructor() {
        this.intitailizeRoutes();
    }

    private intitailizeRoutes() {
        this.router.get(this.path, this.serveIndex);
    }

    private serveIndex = async (request: Request, response: Response) => {
        response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
}
export default IndexController
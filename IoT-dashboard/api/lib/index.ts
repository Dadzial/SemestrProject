import App from "./app";
import IndexController from "./controllers/index.controller";
import DataController from "./controllers/data.controller";
import UserController from "./controllers/user.controller";
import Controller from "./interfaces/controller";
import DataService from "./modules/services/data.service";

const app: App = new App([]);
const io = app.getIo();

app.app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

function createControllers(): Controller[] {
    const dataService = new DataService();

    return [
        new DataController(dataService,io),
        new UserController(),
        new IndexController(),
    ];
}


const controllers = createControllers();

controllers.forEach((controller) => {
    app.app.use("/", controller.router);
});

app.listen();


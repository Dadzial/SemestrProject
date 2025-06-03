import App from "./app";
import IndexController from "./controllers/index.controller";
import DataController from "./controllers/data.controller";
import UserController from "./controllers/user.controller";
import Controller from "./interfaces/controller";
import DataService from "./modules/services/data.service";

const app: App = new App([]);

function createControllers(): Controller[] {
    const dataService = new DataService();

    return [
        new DataController(dataService),
        new UserController(),
        new IndexController(),
    ];
}


const controllers = createControllers();

controllers.forEach((controller) => {
    app.app.use("/", controller.router);
});

app.listen();


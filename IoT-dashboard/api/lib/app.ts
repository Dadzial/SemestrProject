import {config} from "./config";
import express  from "express";
import Controller from "./interfaces/controller";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";

class App {
    app: express.Application;


    constructor(Controllers: Controller[]) {
        this.app = express();
        this.initializeMiddlewares();
        this.connectToDatabase();
        this.initializeControllers(Controllers);
    }

    private initializeMiddlewares() :void {
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
    }

    private initializeControllers(controllers: Controller[] = []) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }



    public listen() {
        this.app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    }
}
export default App;
export const config = {
    port: process.env.PORT || 3100,
    supportedDevicesNum: 17,
    socketPort: process.env.SOCKET_PORT || 3000,
    JwtSecret: process.env.JWT_SECRET || 'secret',
    databaseUrl: process.env.DATABASE_URL ||
        'mongodb+srv://twwai:KTp5wYwutrLHPLT@cluster0.ooees.mongodb.net/IoT?retryWrites=true&w=majority'

}
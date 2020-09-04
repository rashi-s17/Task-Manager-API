const app = require('./app');
const port = process.env.PORT;

app.listen(port, (error, response) => {
    console.log("Server is up and listening on the port " + port);
});

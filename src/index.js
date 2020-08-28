const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();
const port = process.env.PORT;

// To automatically Parse the data coming as the request body.
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, (error, response) => {
    console.log("Server is up and listening on the port " + port);
});

const express = require('express');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');
require('./db/mongoose');

const app = express();

// To automatically Parse the data coming as the request body.
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

module.exports = app;


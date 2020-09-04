const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userOneId, userTwo, userTwoId, taskTwo, setupDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create a task',async () => {
    const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'From test'
            })
            .expect(201);
    
    const task = Task.findById(response.body._id);
    expect(task).not.toBeNull();
})

test('Request all tasks for user', async () => {
    const response = await request(app)
                        .get('/tasks')
                        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                        .expect(200);
    expect(response.body.length).toEqual(2);
})

test('Should not delete task for unauthenticated user', async () => {
    await request(app)
            .delete(`/tasks/${taskTwo._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404);

    const task = await Task.findById(taskTwo._id);
    expect(task).not.toBeNull();
})
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup the user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'Mypass123!'
    }).expect(201);
    
    // Asserting that database was changed correctly.
    const userDB = await User.findById(response.body.user._id);
    expect(userDB).not.toBeNull();
 
    // Assertion about response body
    expect(response.body).toMatchObject({
        user:{
            name: 'Andrew'
        },
        token: userDB.tokens[0].token
    })
})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    // Validating that token is stored in database
    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non-existing user', async() => {
    await request(app).post('/users/login').send({
        email: 'no@example.com',
        password: 'pass123#'
    }).expect(500);
})

test('Should get profile for the user', async() => {
    await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);
})

test('Should not get profile for unauthenticated user', async() => {
    await request(app)
            .get('/users/me')
            .send()
            .expect(401);
})

test('Should delete account for user', async() => {
    const response = await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);
    
    // Validating if user was correctly deleted from database
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async() => {
    await request(app)
            .delete('/users/me')
            .send()
            .expect(401);
})

test('Should upload avatar for authenticated user',async () => {
    await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(200);

    // Asserting that data stored in database is of type buffer
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async () => {
    await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                name: 'Rashi'
            })
            .expect(200);

    // Asserting that changes were saved to database
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Rashi');
})

test('Should not update invalid user fields', async () => {
    await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                location: 'Argentina'
            })
            .expect(400)
})
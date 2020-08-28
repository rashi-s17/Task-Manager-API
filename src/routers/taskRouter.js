const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post('/tasks', auth, async (req, res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    } catch{(e)=>{
           res.status(400).send(e);
    }}
});

// GET /tasks?completed=true
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res)=> {
    try{
        // const tasks = Task.findOne({owner: req.user._id});
        // res.send(tasks);
        const match = {};
        const sort = {};
        if(req.query.completed)
        {
            match.completed = (req.query.completed === 'true');
        }
        if(req.query.sortBy)
        {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1);
        }
        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(user.tasks);
    }
    catch{(e) => {
        res.status(500).send();
    }}
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if(_id.length != 24)
    return res.status(400).send('Invalid ID Format. ID must be of 24 characters.');
    try{
        const task = await Task.findOne({
            _id, 
            owner: req.user._id
        });
        if(!task)
            return res.status(404).send();
    
            res.send(task);
    }
    catch{(e) => {
        res.status(500).send();
    }}
});

router.patch('/tasks/:id',auth, async (req, res) => {

    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if(isValidOperation === false)
    {
        return res.status(400).send();
    }  

    try{
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});
        const task = await Task.findOne({_id : req.params.id, owner: req.user._id});
        if(!task)
        return res.status(404).send();

        updates.forEach((update) => {
            task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
    } catch(e) {
        res.status(400).send();
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id :req.params.id, owner: req.user._id});

        if(!task)
        return res.status(404).send();

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;
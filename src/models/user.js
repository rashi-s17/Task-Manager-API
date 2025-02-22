const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error('Invalid E-mail address.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value)
        {
            if(value.includes('password'))
            {
                throw new Error('Your password must not contain the string "password".');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value)
        {
            if(value<0)
            {
                throw new Error('Age must be positive.');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.methods.getAuthToken = async function()
{
    const user = this;
    const token = jwt.sign({ id : user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.tokens;
    delete userObject.password;
    delete userObject.avatar;
    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user)
    throw new Error('Unable to login!');

    const isMatch = await bcrypt.hash(password, user.password);
    if(!isMatch)
    throw new Error('Unable to login!');
    
    return user;
};

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField : 'owner'
});

// Hash plain text password
userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Delete all tasks of a user before deleting that user.
userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({ owner: user._id});
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;
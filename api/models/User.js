const mongoose = require('mongoose');
const {Sechema, model} = mongoose;

const UserSchema = mongoose.Schema({
username : {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 4
},
password : {
    type: String,
    required: true,
    trim: true,
    min: 4
},
});
const User = mongoose.model('User', UserSchema);

exports.User = User;
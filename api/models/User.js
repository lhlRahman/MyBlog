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
const UserModel = mongoose.model('User', UserSchema);

exports.UserModel = UserModel;
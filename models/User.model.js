var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate-v2')


var UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone : { type: String, required: true, unique: true },
    company: { type: String, required: true, ref: 'Company' },
    password: { type: String, select: false },
    rol: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    validated: { type: Boolean, default: true },
})

UserSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', UserSchema, "users")

module.exports = User;
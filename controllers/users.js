var userSchema = require('../schemas/user')
var roleController = require('../controllers/roles')
let bcrypt = require('bcrypt')

module.exports = {
    GetAllUser: async () => {
        return await userSchema.find({}).populate('role');
    },
    GetUserById: async (id) => {
        return await userSchema.findById(id).populate('role');
    },
    GetUserByEmail: async (email) => {
        return await userSchema.findOne({
            email: email
        }).populate('role');
    },GetUserByToken: async (token) => {
        return await userSchema.findOne({
            tokenResetPassword: token
        }).populate('role');
    },
    CreateAnUser: async (username, password, email, role) => {
        let GetRole = await roleController.GetRoleByName(role);
        if (GetRole) {
            newUser = new userSchema({
                username: username,
                password: password,
                email: email,
                role: GetRole._id
            })
            return await newUser.save();
        } else {
            throw new Error("role sai heheeheheh");
        }
    },
    UpdateUser: async function (id, body) {
        let allowFields = ["password", "email", "imgURL"];
        let user = await userSchema.findById(id);
        if (user) {
            for (const key of Object.keys(body)) {
                if (allowFields.includes(key)) {
                    user[key] = body[key]
                }
            }
            return await user.save();
        }
    },
    DeleteUser: async function (id) {
        let user = await userSchema.findById(id);
        if (user) {
            user.status = false;
            return await user.save();
        }
    },
    Login: async function (username, password) {
        let user = await userSchema.findOne({
            username: username
        })
        if (!user) {
            throw new Error("username hoac mat khau khong dung")
        } else {
            console.log(bcrypt.compareSync(password, user.password));
            if (bcrypt.compareSync(password, user.password)) {
                return user;
            } else {
                throw new Error("username hoac mat khau khong dung")
            }
        }

    }
}
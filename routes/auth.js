var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let { check_authentication } = require('../utils/check_auth')
let bcrypt = require('bcrypt')
let {validate,validationSiginUp} = require('../utils/validator')

/* GET users listing. */
router.post('/login', async function (req, res, next) {
    try {
        let body = req.body;
        let username = body.username;
        let password = body.password
        let result = await userController.Login(username, password);
        let token = jwt.sign({
            id: result._id,
            expire: new Date(Date.now() + 24 * 3600 * 1000)
        }, constants.SECRET_KEY)
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error)
    }
});
router.post('/signup',validationSiginUp,validate, async function (req, res, next) {
        try {
            let body = req.body;
            let username = body.username;
            let password = body.password;
            let email = body.email
            let result = await userController.CreateAnUser(
                username, password, email, 'user');
            let token = jwt.sign({
                id: result._id,
                expire: new Date(Date.now() + 24 * 3600 * 1000)
            }, constants.SECRET_KEY)
            CreateSuccessRes(res, 200, token);
        } catch (error) {
            next(error)
        }
    });
router.get("/me", check_authentication, async function (req, res, next) {
    CreateSuccessRes(res, 200, req.user);
})
router.post('/changepassword', check_authentication, async function (req, res, next) {
    let body = req.body;
    let oldpassword = body.oldpassword;
    let newpassword = body.newpassword;
    if (bcrypt.compareSync(oldpassword, req.user.password)) {
        let user = req.user;
        user.password = newpassword;
        await user.save();
        CreateSuccessRes(res, 200, user);
    } else {
        next(new Error("oldpassword khong dung"))
    }
})

module.exports = router;

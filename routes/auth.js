var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let { check_authentication } = require('../utils/check_auth')
let bcrypt = require('bcrypt')
let { validate, validationSiginUp } = require('../utils/validator')
let crypto = require('crypto')
let mailer = require('../utils/mailer')

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
router.post('/signup', validationSiginUp, validate, async function (req, res, next) {
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
router.post('/forgotpassword', async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.GetUserByEmail(email);
        if (user) {
            user.tokenResetPassword = crypto.randomBytes(24).toString('hex');
            user.tokenResetPasswordExp = (new Date(Date.now() + 10 * 60 * 1000)).getTime();
            await user.save();
            let URLReset = `http://localhost:3000/auth/resetpassword/${user.tokenResetPassword}`
            await mailer.sendmailFrogetPass(user.email, URLReset)
            CreateSuccessRes(res, 200, {
                url: URLReset
            })
        } else {
            throw new Error("email khong ton tai")
        }
    } catch (error) {
        next(error)
    }
})


router.post('/resetpassword/:token', async function (req, res, next) {
    try {
        let token = req.params.token;
        let user = await userController.GetUserByToken(token);
        if (user) {
            if (user.tokenResetPasswordExp > Date.now()) {
                let password = req.body.password;
                user.password = password;
                user.tokenResetPassword = null;
                user.tokenResetPasswordExp = null;
                await user.save();
                CreateSuccessRes(res, 200, user)
            } else {
                throw new Error("token het han")
            }
        } else {
            throw new Error("email khong ton tai")
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router;

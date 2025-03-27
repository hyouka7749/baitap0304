let { body, validationResult } = require('express-validator');
const { ERROR_USERNAME, ERROR_EMAIL, ERROR_PASSWORD } = require('./constants');
let util = require('util')

let constants = require('./constants')
let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }
}
module.exports = {
    validate: function (req, res, next) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            CreateSuccessRes(res, 404, errors.array());
        } else {
            next()
        }
    },
    validationSiginUp: [
        body("username").isAlphanumeric().withMessage(ERROR_USERNAME),
        body("password").isStrongPassword(options.password).withMessage(util.format(ERROR_PASSWORD,
            options.password.minLength,
            options.password.minLowercase,
            options.password.minUppercase,
            options.password.minNumbers,
            options.password.minSymbols,
        )),
        body("email").isEmail().withMessage(constants.ERROR_EMAIL)
    ],
    validationCreateUser: [
        body("username").isAlphanumeric().withMessage(ERROR_USERNAME),
        body("password").isStrongPassword(options.password).withMessage(ERROR_PASSWORD),
        body("email").isEmail().withMessage(util.format(ERROR_PASSWORD,
            options.password.minLength,
            options.password.minLowercase,
            options.password.minUppercase,
            options.password.minNumbers,
            options.password.minSymbols,
        )),
        body('role').isIn(['user', 'admin', 'mod']).withMessage("role khong hop le")
    ]
}
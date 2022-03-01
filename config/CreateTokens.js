import jwt from "jsonwebtoken";
import _ from "lodash";

/**
 * Create jwt for user authentication.
 * @param {*} payload 
 * @param {*} secret 
 * @param {*} expiresIn 
 * @returns 
 */
export const createToken = (payload, secret, expiresIn) =>
jwt.sign({
    payload,
   },
     secret, {expiresIn: expiresIn});

export const createTokens = (payload, refreshSecret) => {
const token = createToken(
payload,
process.env.JWT_SECRET_KEY,
`${process.env.JWT_ACCESS_TOKEN_EXPIRES}`
);

const refreshToken = createToken(
payload,
refreshSecret,
`${process.env.JWT_REFRESH_TOKEN_EXPIRES}`
);
return [token, refreshToken];
};
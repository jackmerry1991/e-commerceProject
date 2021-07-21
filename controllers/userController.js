const userModel = require('../models/userModel');
const userModelInstance = new userModel();

module.exports = class UserController {

    async getUser(req, res){
        console.log('/get-user running');
        const userId = req.params.id;
        if(!req.params.id) return res.status(400).send('Insuffience data');
        try{
            const result = await userModelInstance.findUserById(userId);
            if(!result) return res.status(200).send('No user found');
            res.json(result);
        }catch(err){
            return res.status(500).send('Error retrieving results from database');
        }
    }
}


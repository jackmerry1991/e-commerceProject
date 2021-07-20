const { response } = require('express');
const express = require('express');
const db = require('../database/dbConnection.js')
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = class UserModel {

    /**
     * Return all users
     * @returns json object
     */
    async findAll(){
        try{
            const result = await db.query('SELECT * FROM users');
            if(result.rows.length < 1) return null;
            console.log('usermodel results = ' + result)
            return result;
        }catch(err){
            console.log(err);
        }
    }

    async findUserById(data){
        try{
            const query = 'SELECT * FROM users WHERE user_id = $1';
            const result = await db.query(query, [data]);
            if(!result.rows.length > 0) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }
    /**
     * Find user by email
     * @param {*} data 
     * @returns 
     */
    async findUserByEmail(data){
        console.log(data);
        try{
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [data]);
            if(!(await result).rows.length > 0) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    /**
     * Create new user and add to users table.
     * @param {*} data 
     * @returns 
     */
    async create(data){
        console.log(data);
        try{
            const salt = await bcrypt.genSalt(10);
            let encryptedPassword = await bcrypt.hash(data.password, salt);
            console.log(encryptedPassword);
            db.query('INSERT INTO USERS(email, first_name, last_name, street, city, password, post_code) VALUES($1, $2, $3, $4, $5, $6, $7);', [data.email, data.firstName, data.lastName, data.street, data.city, encryptedPassword, data.postCode]);
            return 'User created';
        }catch(err){

        }
    }

    async update(data){
        try{
            const query = `UPDATE users SET ${data.columnToUpdate} = $1 WHERE user_id = $2`;
            await db.query(query, [data.newValue, data.userId]);
        }catch(err){
            console.log(err);
        }
    }

    async delete(data){
        console.log('param' + data);
        const userId = [data];
        try{
            const query = 'DELETE FROM users WHERE user_id = $1';
            db.query(query, userId);
        }catch(err){
            console.log(err);
        }
    }

    async checkUserPayment(data){
        try{
            const result = await db.query('SELECT payment_details FROM users where user_id = $1', [userId]);
            if(result.rows < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }
}
import db from '../database/index'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Validator from '../Helper/validation';
import  { comparePassword, generateToken, hashPassword } from '../Helper/auth';


class User{
    userSignup(req, res) {  
        
        const { error } = Validator.validateReistration(req.body)
        if( error ){
            return res.status(400).send({
              status: 400,
              message: error.details[0].message
            });
        }
        
        const password = hashPassword(req.body.password);
        
        const create_new_user=`INSERT INTO 
            users(firstname, lastname, email, username, password) 
            values ($1, $2, $3, $4, $5) returning *`;
        
        const newUser=[
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.body.username,
            password
        ]

        return  db.query(create_new_user, newUser)
            .then(({rows}) => {

                const token = generateToken({id: rows[0].id, email: rows[0].email});
                return res.status(201).send({
                    status: 201,
                    data: rows,
                    token: token,
                    message: 'User registered successfully'
                });
            
            }).catch((err) => {
                
                if (err.routine === '_bt_check_unique') {
                    return res.status(400).send({
                        status: 400,
                        message: 'User with the email already exist'
                    })
                }
                return res.status(400).send({
                    status: 400,
                    message: err
                })
            });          
    }

    async userLogin(req, res){
        try {
            // validate request
            const isInvalid = Validator.loginUser(req.body);
            if(isInvalid) {
                throw Object.assign({}, isInvalid);
            };
            // fetch user details 
            const userQuery = `SELECT * FROM users where username = $1`;
            const params = [req.body.username];
            const dbQuery = await db.query(userQuery, params);
            const user = dbQuery.rows[0];
            if(!user) {
                throw `User with username ${req.body.username} doesn't exist`
            }
            // compare password provide that user exist
            const validPassword = comparePassword(user.password, req.body.password);
            // throw (terminate the req if user does not exist)
            if(!validPassword) {
                throw `Invalid password`;
            }
            // generate jwt token 
            const token= generateToken({id: user.id, email: user.email});
            // respond
            return res.status(200).send({
                status: 200,
                message: "User signed in successfully",
                data:[{
                    'token':token
                }]
            });           
        } catch (error) {
            //consolidate all error into this exiting point
            return res.status(400).send({
                status: 400,
                message: error
            })   
        } 
        
    }
    getAllUsers(req,res){
        res.status(200).send({
          status: 200,
          message:"Users fetched successfully",
          data:{
            users
          }
        });
    }

    async oldUserSignup(req,res){
        const { error } = validateNewUser.validateReistration(req.body)
        if( error ){
            return res.status(400).send({
              status: 400,
              message: error.details[0].message
            });
        }

        let user = users.find(item => item.username === req.body.username);
        if(user)
         {
            return res.status(400).send({
                status: 400,
                message:"User already exists"
            });
    
         }

        user = {
            id: users.length+1,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }    

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password,salt);
        
        const token = jwt.sign({id: user.id},process.env.JWTPRIVATEKEY)

        users.push(user);
        return res.status(201).send({
            status: 201,
            message:"User registered successfully",
            data:[{
                'token':token
            }]
            
        })
    }
     async oldUserLogin(req,res){

        const { error }= validateNewUser.validateLogin(req.body)
        if( error ){
            return res.status(404).send({
              status: 404,
              message: error.details[0].message
            })
           
        }
        let user= users.find(item=>item.username === req.body.username);
        
        if(!user) return res.status(404).send({
            status: 404,
            message:"Invalid username or password"
        })
        const validPassword= await  bcrypt.compare(req.body.password, user.password);
     
        if(!validPassword) return res.status(404).send({
            status: 404,
            message:"Invalid username or password"
        })

        const token= jwt.sign({id: user.id},process.env.JWTPRIVATEKEY)
        res.status(200).send({
            status: 200,
            message: "User signed in successfully",
            data:[{
                'token':token
            }]
        })
    }
}

export default new User;


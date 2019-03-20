import { Router } from "express";
import User from "../controllers/usercontroller";


const userRouter=Router();

userRouter.post('/auth/signup',User.userSignup);
userRouter.post('/auth/login',User.userLogin);
userRouter.get('/users',User.getAllUsers);

export default userRouter;
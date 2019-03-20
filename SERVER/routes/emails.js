import { Router } from 'express';
import Messages from '../controllers/emailControlles';
import { requireAuth } from '../middlewares';
const routers= Router();

//create new message
routers.post('/messages', requireAuth, Messages.sendMessage);
//read all received messages
routers.get('/messages', requireAuth, Messages.readMessage);
//read all sent, unread and draft messages
routers.get('/messages/:status', requireAuth, Messages.readMessages);

// update message status 
// delete message


// create group
// add user into group
// delete user into group
// get group mails
// 

export default routers;
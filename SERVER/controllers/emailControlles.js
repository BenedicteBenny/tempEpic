import db from '../database';
import Validator from '../Helper/validation';


class Messages{
    /*
         POST /messages => Create or send an ​email​. 
    */
    async sendMessage(req,res) {
        try {
            // validate the request
            const isInvalid = Validator.sendMessage(req.body);
            if(isInvalid) {
                return res.status(400).send({
                    status: 400,
                    message: isInvalid
                });
            };
            // fetch reciver details
            const userQuery = `SELECT * FROM users where username = $1`;
            const userParams = [req.body.receiver];
            const userDbQuery = await db.query(userQuery, userParams);
            const receiver = userDbQuery.rows[0];
            if(!receiver) {
                return res.status(400).send({
                    status: 400,
                    message: "Unknown receiver"
                });
            }
            
            const messageQuery = `INSERT INTO messages(sender_id, receiver_id, parent_message_id, subject, message, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;
            const messageParams = [
                req.user.id,
                receiver.id,
                null,
                req.body.subject,
                req.body.message,
                'unread'
            ];
            
            const mailsDbQuery = await db.query(messageQuery, messageParams);

            return res.status(200).send({
                status: 200,
                data: mailsDbQuery.rows
            });
        } catch (error) {
            return res.status(400).send({
                status: 400,
                message: error
            });
        }
    }
    /*
        GET /messages/unread => Fetch all ​unread received emails 
        GET /messages/sent => Fetch all ​sent emails 
    */
    async readMessages(req, res) {
        const status = req.params.status;
        const isInvalid = Validator.readMessages(status);
        if(isInvalid) {
            return res.status(400).send({
                status: 400,
                message: isInvalid
            });
        };
        
        try {
            switch (status) {
                case 'sent':
                    const sentQuery = `SELECT * FROM messages where sender_id = $1 and status != $2 `;
                    const sentParams = [req.user.id, 'draft'];
                    const sentMessagesDbQuery = await db.query(sentQuery, sentParams);
                    return res.status(200).send({
                        status: 200,
                        data: sentMessagesDbQuery.rows
                    });
                case 'unread':
                    const unreadQuery = `SELECT * FROM messages where sender_id = $1 and status = $2 `;
                    const unreadParams = [req.user.id, 'unread'];
                    const unreadMessagesDbQuery = await db.query(unreadQuery, unreadParams);
                    return res.status(200).send({
                        status: 200,
                        data: unreadMessagesDbQuery.rows
                    });
                case 'draft':
                    const draftQuery = `SELECT * FROM messages where sender_id = $1 and status = $2 `;
                    const draftParams = [req.user.id, 'draft'];
                    const draftMessagesDbQuery = await db.query(draftQuery, draftParams);
                    return res.status(200).send({
                        status: 200,
                        data: draftMessagesDbQuery.rows
                    });
                default:
                    return res.status(400).send({
                        status: 400,
                        message: "Invalid status"
                    });
            }
            
        } catch (error) {
            return res.status(400).send({
                status: 400,
                message: error
            });
        }
    }
    /*
        GET /messages => Fetch all ​received​ ​emails
    */
    async readMessage(req, res) {
        try {
            const receivedQuery = `SELECT * FROM messages where receiver_id = $1 and status != $2 ` // not eq draft and 
            const receivedParams = [req.user.id, 'draft'];
            const receivedMessagesDbQuery = await db.query(receivedQuery, receivedParams);
            return res.status(200).send({
                status: 200,
                data: receivedMessagesDbQuery.rows
            });
        } catch (error) {
            return res.status(400).send({
                status: 400,
                message: error
            });
        }
    }
}

export default new Messages;
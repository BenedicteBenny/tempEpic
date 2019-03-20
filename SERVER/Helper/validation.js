import Joi from 'joi';


function formatError(errors) {
	const result = {};
	(errors || []).forEach( error => {
		if(Array.isArray(result[error.context.key])){
			result[error.context.key].push(error.message.replace(/"([^"]+(?="))"/g, '$1'));
		}else {
			result[error.context.key] = [error.message.replace(/"([^"]+(?="))"/g, '$1')]
		}
	});

	return result;
}

export default class Validate {
	
	static validateReistration(user) {
		const schema = {
			firstname: Joi.string().min(2).max(15).required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `Firstname should not be empty!`;
							break;
						case 'string.min':
							err.message = `Firstname should have at least ${err.context.limit} characters!`;
							break;
						case 'string.max':
							err.message = `Firstname should have at most ${err.context.limit} characters!`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			lastname: Joi.string().min(2).max(10).required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `lastname should not be empty!`;
							break;
						case 'string.min':
							err.message = `lastname should have at least ${err.context.limit} characters!`;
							break;
						case 'string.max':
							err.message = `lastname should have at most ${err.context.limit} characters!`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			email: Joi.string().required().email().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case `any.empty`:
							err.message = `Email should not be empty!`;
							break;
						case 'string.email':
							err.message = `Please enter a correct email`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			username: Joi.string().min(5).max(10).required().trim().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `Username should not be empty!`;
							break;
						case 'string.min':
							err.message = `Username should have at least ${err.context.limit} characters!`;
							break;
						case 'string.max':
							err.message = `Username should have at most ${err.context.limit} characters!`;
							break;
						case 'string.trim':
							err.message = `You must enter only one username`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			password: Joi.string().min(8).alphanum().required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `Password should not be empty!`;
							break;
						case 'string.alphanum':
							err.message = `Please use both numbers and letters`;
							break;
						case 'string.min':
							err.message = `Password should have at least ${err.context.limit} characters!`;
							break;
						default:
							break;
					}
				});
				return errors;
			})
		};

		return Joi.validate(user, schema);
	}
	static validateLogin(user) {
		const schema = {
			username: Joi.string().min(5).max(10).required().trim().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `User should not be empty!`;
							break;
						case 'string.min':
							err.message = `User should have at least ${err.context.limit} characters!`;
							break;
						case 'string.max':
							err.message = `User should have at most ${err.context.limit} characters!`;
							break;
						case 'string.trim':
							err.message = `You must enter only one username`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			password: Joi.string().min(8).alphanum().required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `Password should not be empty!`;
							break;
						case 'string.alphanum':
							err.message = `Please use both numbers and letters`;
							break;
						case 'string.min':
							err.message = `Password should have at least ${err.context.limit} characters!`;
							break;
						default:
							break;
					}
				});
				return errors;
			})
		};

		return Joi.validate(user, schema);
	}

	static validateEmail(email) {
		const schema = {
			receiver_username: Joi.string().min(5).max(10).required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case 'any.empty':
							err.message = `Receiver should not be empty!`;
							break;
						case 'string.min':
							err.message = `Receiver should have at least ${err.context.limit} characters!`;
							break;
						case 'string.max':
							err.message = `Receiver should have at most ${err.context.limit} characters!`;
							break;
						default:
							break;
					}
				});
				return errors;
			}),
			message: Joi.string().required().error((errors) => {
				errors.forEach((err) => {
					switch (err.type) {
						case `any.empty`:
							err.message = `Email should not be empty!`;
							break;
						default:
							break;
					}
				});
				return errors;
			})
		};

		return Joi.validate(email, schema);
	}

	static createUser(user) {
		const schema = Joi.object()
			.keys({
				firstname: Joi.string().trim().alphanum().min(3).max(30).required(),
				lastname: Joi.string().trim().alphanum().min(3).max(30).required(),
				username: Joi.string().trim().alphanum().min(3).max(30).required(),
				email: Joi.string().email({ minDomainAtoms: 2 }).required(),
				password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
			})
			.with('username', 'email')

		const result = Joi.validate(user, schema, { abortEarly: false});
		
		if(result.error !== null) {
			return formatError(result.error.details);
		}
		return result.error;
	}

	static loginUser(credentials) {
		const schema = Joi.object()
			.keys({
				username: Joi.string().trim().alphanum().min(3).max(30).required(),
				password: Joi.string().trim().regex(/^[a-zA-Z0-9]{3,30}$/).required()
			})
			.with('username', 'password');

		const result = Joi.validate(credentials, schema, { abortEarly: false});

		if(result.error !== null) {
			return formatError(result.error.details);
		}
		return result.error;
	}
	static sendMessage(message) {
		const schema = Joi.object()
			.keys({
				receiver: Joi.string().trim().alphanum().min(3).max(30).required(),
				subject: Joi.string().trim().min(3).max(120).required(),
				message: Joi.string().trim().min(3).max(500).required()
			});

		const result = Joi.validate(message, schema, { abortEarly: false});
		
		if(result.error !== null) {
			return formatError(result.error.details);
		}
		return result.error;
	}
	static readMessages(status) {
		const schema = Joi.string().trim().alphanum().min(3).max(30).required();

		const result = Joi.validate(status, schema, { abortEarly: false});
		
		if(result.error !== null) {
			return formatError(result.error.details);
		}
		return result.error;
	}
}



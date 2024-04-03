class DuplicateEmailError extends Error {
  constructor() {
    super('Email already exists.');
    this.name = 'DuplicateEmailError';
    this.status = 409;
  }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
    }
}

class InvalidPasswordError extends Error {
  constructor() {
    super('Password must have the following requirements: 8-20 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.');
    this.name = 'InvalidPasswordError';
    this.status = 400;
  }
}

class InvalidNameError extends Error {
  constructor() {
    super('Name must contain only alphabets, hyphens, and spaces.');
    this.name = 'InvalidNameError';
    this.status = 400;
  }
}

class InternalServerError extends Error {
  constructor(message = 'An error occurred. Please try again.') {
    super(message);
    this.name = 'InternalServerError';
    this.status = 500;
  }
}

module.exports = {
    DuplicateEmailError,
    InvalidPasswordError,
    InvalidNameError,
    InternalServerError,
    NotFoundError
};
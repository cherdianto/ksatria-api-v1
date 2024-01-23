import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';

import UserModel from './model';
import { formatResponse } from '../util';

// Getting all user
const get = (req, res) => {
  UserModel.find()
    .then((users) => {
      // case db = empty
      if (users.length === 0) {
        return res
          .status(200)
          .json(
            formatResponse('Database is empty', true),
          );
      }
      return res.status(200).json(
        formatResponse('Successfully retrieve all user data', true, undefined, { users }),
      );
    })
    .catch((err) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

// Add user
const create = (req, res) => {
  const newUser = new UserModel({
    name: req.body.name,
    fingerprint: nanoid(),
  });

  newUser.save()
    .then(() => {
      res.status(201).send(
        formatResponse('Successfully register user', true, undefined, { user: newUser }),
      );
    })
    .catch((err) => {
      res.status(500).send(formatResponse(err.message, false, 500, undefined));
    });
};

// HARD Delete a user by id
const remove = (req, res) => {
  // get user id
  const { id } = req.params;

  UserModel.findByIdAndDelete(id)
    .then((data) => {
      // case user not found
      if (!data) {
        res
          .status(404)
          .send(
            formatResponse(
              `Cannot delete user with id= ${id}. Failed to find user with that id`,
              false,
              404,
              undefined,
            ),
          );
      } else {
        res.send(
          formatResponse('Successfully delete user', true, undefined, undefined),
        );
      }
    })
    .catch((err) => {
      res.status(500).send(formatResponse(err.message, false, 500, undefined));
    });
};

export default {
  get,
  create,
  remove,
};

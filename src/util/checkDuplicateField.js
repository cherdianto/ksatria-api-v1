import UserModel from '../services/user/user.model'

const checkDuplicateField = async (field, value) => {
  const query = {};
  query[field] = value;
  return await UserModel.findOne(query);
};

export default checkDuplicateField;
import bcrypt from 'bcrypt';

export const comparePasswords = (plainText, hashedPassword) => {
  return bcrypt.compareSync(plainText, hashedPassword);
};
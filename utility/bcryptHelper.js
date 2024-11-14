// @ts-nocheck
import bcrypt from "bcryptjs";

const salt = 15;

//hashing passwords
export const hashPassword = (plainPassword) => {
  const hashPassword = bcrypt.hashSync(plainPassword, salt);

  return hashPassword;
};

//comparing passwords
export const comparePassword = (plainPassword, hashPassword) => {
  return bcrypt.compareSync(plainPassword, hashPassword);
};

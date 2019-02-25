import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);

export const hash = async (password) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hashed) => {
      if (err) reject (err);
      resolve(hashed);
    });
  });

  return hashedPassword;
}
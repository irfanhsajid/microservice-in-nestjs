import * as bcrypt from 'bcrypt';

export const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export const comparePassword = async (
  plainTextPassword: string,
  hash: string,
): Promise<boolean> => {
  const status = await bcrypt.compare(plainTextPassword.trim(), hash);
  console.log('compare status', status, plainTextPassword, hash);
  return status;
};

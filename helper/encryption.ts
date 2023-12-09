import * as bcrypt from 'bcrypt';
const SALT = 10;

export const encryptData = async (data: string) => {
  return await bcrypt.hash(data, SALT)
}

export const decryptData = async (data: string, hash: string) => {
  return await bcrypt.compare(data, hash)
}
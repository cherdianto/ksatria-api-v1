import crypto from 'crypto'

const tokenGenerator = () => {
  const buffer = crypto.randomBytes(32);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export default tokenGenerator;
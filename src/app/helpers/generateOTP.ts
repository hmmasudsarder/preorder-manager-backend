export const generateOTP = (): number => {
  return Math.floor(10000 + Math.random() * 90000); // 5-digit number
};

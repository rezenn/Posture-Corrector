import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/users';

export const loginWithGoogle = async (access_token: string) => {
  const res = await axios.post(`${BASE_URL}/google-login`, {
    access_token,
  });
  return res.data;
};

export const registerUser = async (userData: any) => {
  const res = await axios.post(`${BASE_URL}/register`, userData);
  return res.data;
};

export const loginUser = async (loginData: any) => {
  const res = await axios.post(`${BASE_URL}/login`, loginData);
  return res.data;
};

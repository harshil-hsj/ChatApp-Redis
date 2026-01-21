import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL;

export const getMessages = async (after) => {
  const res = await axios.get(`${API_URL}/api/chat/messages?after=${after?after:0}`);
  return res
};

export const postMessage = async (messageData) => {
  const res = await axios.post(`${API_URL}/api/chat/send`, messageData);
  return res;
};

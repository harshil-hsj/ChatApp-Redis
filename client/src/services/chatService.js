import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

export const getMessages = () => {
  return axios.get(API_URL);
};

export const postMessage = (messageData) => {
  return axios.post(API_URL, messageData);
};

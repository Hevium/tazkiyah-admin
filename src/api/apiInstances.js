import axios from "axios";

// export const BASE_URL = "http://localhost:5000";
export const BASE_URL = "https://api.attazkiyah.org";

export const apiGet = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "GET88281F7CC86EA3FBCCAA82C57BA8E",
  },
});

export const apiPost = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "POST15949714ABAD2266CFF6CFE3DC752",
  },
});

export const apiPut = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "PUTA16F49C34EBE6173E487E2425E7FE",
  },
});

export const apiDelete = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "DELETE4ECEBFFE57B7EB1BE31F2CCD66AC7",
  },
});

export const apiUpload = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-api-key": "POST15949714ABAD2266CFF6CFE3DC752",
  },
});
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change later
});

export const adminLogin = async (data) => {
  const response = await API.post("/admin/login", data);
  return response.data;
};
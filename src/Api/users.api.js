import { axiosInstance } from "./config";

export const getUsers = () => {
  return axiosInstance.get("/users");
};

export const createUser = (data) => {
  return axiosInstance.post("/users", data);
};

export const updateUser = (id, data) => {
  return axiosInstance.post(`/users/${id}`, data);
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`/users/${id}`);
};

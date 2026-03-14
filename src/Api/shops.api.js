import { axiosInstance } from "./config";

export const getShops = () =>
  axiosInstance.get("/shops");

export const createShop = (data) =>
  axiosInstance.post("/shops", data);

export const updateShop = (id, data) =>
  axiosInstance.post(`/shops/${id}`, data);

export const deleteShop = (id) =>
  axiosInstance.delete(`/shops/${id}`);
import { axiosInstance } from "./config";

export const getShifts = () => axiosInstance.get("/shifts");

export const createShift = (data) => axiosInstance.post("/shifts", data);

export const updateShift = (id, data) =>
  axiosInstance.post(`/shifts/${id}`, data);

export const deleteShift = (id) =>
  axiosInstance.delete(`/shifts/${id}`);

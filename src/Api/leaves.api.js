import { axiosInstance } from "./config";

export const getLeaves = () => axiosInstance.get("/leaves");

export const updateLeave = (id, data) =>
  axiosInstance.post(`/leaves/${id}`, data);

export const deleteLeave = (id) =>
  axiosInstance.delete(`/leaves/${id}`);

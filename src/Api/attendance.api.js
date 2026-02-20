import { axiosInstance } from "./config";

/* Get all attendance (admin view) */
export const getAttendances = () => {
  return axiosInstance.get("/attendance");
};

/* Get attendance history by user */
export const getAttendanceByUser = (userId) => {
  return axiosInstance.get(`/attendance/history/${userId}`);
};
export const getAttendanceTimings = (attendanceId) => {
  return axiosInstance.get(
    `/attendance/${attendanceId}/timings`
  );
};
/* Get today attendance by user */
export const getTodayAttendance = (userId) => {
  return axiosInstance.get(`/attendance-today/${userId}`);
};

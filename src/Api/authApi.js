import { axiosInstance } from "./config";

// LOGIN
export const loginUser = (data) => {
  return axiosInstance.post("/login", data);
};

// REGISTER
export const registerUser = (data) => {
  return axiosInstance.post("/auth/register", data);
};

// GOOGLE LOGIN (later)
export const googleLoginUser = (tokenId) => {
  return axiosInstance.post("/auth/google-login", { tokenId });
};

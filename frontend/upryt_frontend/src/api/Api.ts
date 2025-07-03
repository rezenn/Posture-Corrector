import axios from "axios";
import type { ApiResponse } from "../types/ApiResponse";

const Api = axios.create({
    baseURL: `http://localhost:3000/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export const validateUsernameUnique = async (username: string) => Api.get(`/user/check-username-unique?username=${username}`);
export const registerUser = async (data: any) => Api.post<ApiResponse>("/user/register-user", data);
export const loginUser = async (data: any) => Api.post<ApiResponse>("/user/login-user", data);
export const loginUserWithGoogle = async (access_token: string) => Api.post<ApiResponse>("/user/google-login", { access_token });
export const sendVerificationEmailForRegistration = async (email: string) => Api.post<ApiResponse>("/user/send-verification-email", email);


export default Api;
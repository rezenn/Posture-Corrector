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
export const sendVerificationEmailForRegistration = async (email: string) => Api.put<ApiResponse>("/user/send-verification-email-registration", email);
export const verifyAccountForRegistration = async (data: any) => Api.put<ApiResponse>("/user/verify-account-registration", data);
export const forgotPassword = async (data: any) => Api.put<ApiResponse>("/user/forgot-password", data);
export const verifyAccountForResetPassword = async (data: any) => Api.put<ApiResponse>("/user/verify-account-reset-password", data);
export const resetPassword = async (data: any) => Api.put<ApiResponse>("/user/reset-password", data);

export const uploadUserProfilePicture = async (formData: any) => {
    return Api.put("/user/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export const updateProfileDetails = async (data: any) => {
    const token = localStorage.getItem("upryt-app-token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    return Api.put(`/user/update-profile-details/${data.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteUser = async (data: any) => {
    const token = localStorage.getItem("upryt-app-token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    return Api.delete("/user/delete-user", {
        data,
        headers: { Authorization: `Bearer ${token}` }
    });
};

export default Api;
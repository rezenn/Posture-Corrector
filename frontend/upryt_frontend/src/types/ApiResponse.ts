interface User {
    fullName: string;
    username: string;
    email: string;
    password: string;
    contact: string;
    profilePictureUrl: string;
    isVerified: boolean;
    verifyCode: string;
    verifyCodeExpiryDate: Date;
    verifyEmailResetPassword: string,
    verifyEmailResetPasswordExpiryDate: Date,
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    user: User;
}
export interface AuthResponse {
    userId: number;
    name: string;
    email: string;
    role: string;
    message: string;
}

export interface SigninRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    role: string;
}
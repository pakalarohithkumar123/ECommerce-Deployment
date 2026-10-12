import type {
    AuthResponse,
    SigninRequest,
    SignupRequest
} from "../types/auth";

export async function signup(
    data: SignupRequest
): Promise<string> {
    const response = await fetch(
        "http://localhost:8081/api/auth/signup",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Signup failed");
    }

    return await response.text();
}

export async function signin(
    data: SigninRequest
): Promise<AuthResponse> {
    const response = await fetch(
        "http://localhost:8081/api/auth/signin",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Invalid Email or Password");
    }

    return await response.json();
}
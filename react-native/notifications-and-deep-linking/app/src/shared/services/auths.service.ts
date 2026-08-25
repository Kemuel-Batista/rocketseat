import { RegisterHttpParams } from "../interfaces/http/register";
import { baseURL, marketPlaceApiClient } from "../api/market-place";
import { AuthResponse } from "../interfaces/http/auth-response";
import { LoginHttpParams } from "../interfaces/http/login";
import { UploadAvatarResponse } from "../interfaces/http/upload-avatar";

export const register = async (userData: RegisterHttpParams) => {
  const { data } = await marketPlaceApiClient.post<AuthResponse>(
    "/auth/register",
    userData
  );

  return data;
};

export const login = async (userData: LoginHttpParams) => {
  const { data } = await marketPlaceApiClient.post<AuthResponse>(
    "/auth/login",
    userData
  );

  data.user.avatarUrl = `${baseURL}${data.user.avatarUrl}`;

  return data;
};

export const uploadAvatar = async (avatarUri: string) => {
  const formData = new FormData();

  formData.append("avatar", {
    uri: avatarUri,
    type: "image/jpeg",
    name: "avatar.jpg",
  } as unknown as Blob);

  const { data } = await marketPlaceApiClient.post<UploadAvatarResponse>(
    "/user/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  data.url = `${baseURL}${data.url}`;

  return data;
};

export const handleRefreshToken = async (refreshToken: string) => {
  const { data } = await marketPlaceApiClient.post<{
    token: string;
    refreshToken: string;
  }>("/auth/refresh", { refreshToken });

  return data;
};

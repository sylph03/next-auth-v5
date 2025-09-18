import { object, string } from "zod";

export const signInSchema = object({
  email: string()
    .min(1, { message: "Email là bắt buộc" })
    .email({ message: "Email không hợp lệ" }),
  password: string()
    .min(1, { message: "Mật khẩu là bắt buộc" })
    .min(8, { message: "Mật khẩu phải nhiều hơn 8 ký tự" })
    .max(32, { message: "Mật khẩu phải ít hơn 32 ký tự" }),
});

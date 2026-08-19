export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.';

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

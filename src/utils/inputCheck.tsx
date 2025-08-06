export function emptyCheck(inputText: string) {
  return inputText ? true : false;
}

export function nameCheck(name: string) {
  const nameRegex = /^[\u4e00-\u9fffa-zA-Z0-9]{2,8}$/;
  const result = nameRegex.test(name);
  return result;
}

export function emailCheck(email: string) {
  const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/;
  const result = mailRegex.test(email);
  return result;
}

export function passwordCheck(password: string) {
  const passwordRegex = /^\w{6,15}$/;
  const result = passwordRegex.test(password);
  return result;
}

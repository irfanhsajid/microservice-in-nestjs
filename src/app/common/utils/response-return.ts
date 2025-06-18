export const responseReturn = (
  message: string | null = null,
  data: any = {},
  code: number = 200,
) => {
  return {
    message: message,
    status: code,
    ...data,
  };
};

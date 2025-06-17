import { HttpException, HttpStatus } from '@nestjs/common';

export const throwCatchError = (error: any) => {
  if (!(error instanceof HttpException)) {
    throw new HttpException(
      { message: 'Internal server error' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  throw error;
};

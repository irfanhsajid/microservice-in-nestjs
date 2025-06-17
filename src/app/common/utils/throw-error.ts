import { HttpException, HttpStatus } from '@nestjs/common';

export const throwCatchError = (error: any) => {
  if (!(error instanceof HttpException)) {
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  throw error;
};

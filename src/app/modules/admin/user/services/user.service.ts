import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { PaginationEnum } from '../../common/enums/pagination.enum';

@Injectable()
export class AdminUserService implements ServiceInterface {
  constructor() {}

  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  async index(req: Request, params: any): Promise<Record<string, any>> {
    const page = params.page || PaginationEnum.DEFAULT_PAGE;
    const limit = params.limit || PaginationEnum.DEFAULT_LIMIT;
    const search = params.search || '';
    const orderBy = params.sort_column || PaginationEnum.DEFAULT_SORT_COLUMN;
    const orderDirection =
      params.sort_direction || PaginationEnum.DEFAULT_SORT_ORDER;

    return new Promise((resolve, reject) => {});
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {});
  }

  store(req: Request, dto: any): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  update(req: Request, dto: any, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}

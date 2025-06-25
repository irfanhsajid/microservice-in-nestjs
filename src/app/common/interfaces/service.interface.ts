export interface ServiceInterface {
  index(req: Request, params: any): Record<string, any>;
  store(req: Request, dto: any): Record<string, any>;
  show(req: Request, id: number): Record<string, any>;
  update(req: Request, dto: any, id: number): Record<string, any>;
  destroy(req: Request, id: number): Record<string, any>;
}

export class ProductModelServer {
  id: number;
  title: string;
  image: string;
  images: string;
  description: string;
  price: number;
  quantity: number;
  // tslint:disable-next-line:variable-name
  short_desc: string;
}

export class ServerResponse {
  count: number;
  products: ProductModelServer[];
}

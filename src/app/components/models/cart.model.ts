import {ProductModelServer} from './product.model';

export class CartModelServer {
  total = 0;
  data: CartItemServer[] = [];
}

export class CartModelPublic {
  total = 0;
  prodData: CartItemPublic[] = [];
}

export class CartItemServer {
  numInCart: number;
  product: ProductModelServer;
}

export class CartItemPublic {
  id: number;
  inCart: number;
}

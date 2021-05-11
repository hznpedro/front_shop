import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProductService} from './product.service';
import {OrderService} from './order.service';
import {environment} from '../../environments/environment';
import {CartModelPublic, CartModelServer} from '../components/models/cart.model';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {ProductModelServer} from '../components/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private serverURL = environment.SERVER_URL;

  // Data variable to store the cart information on the client's local storage
  private cartDataClient = new CartModelPublic();

  // Data variable to store cart information on the server
  private cartDataServer = new CartModelServer();

  /* OBSERVABLES FOR THE COMPONENTS TO SUBSCRIBE */
  public cartTotal$: BehaviorSubject<number>;
  public cartData$: BehaviorSubject<CartModelServer>;

  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrderService,
              private router: Router) {
    this.cartTotal$ = new BehaviorSubject(this.cartDataServer.total);
    this.cartData$ = new BehaviorSubject(this.cartDataServer);

    // Get the information from local storage
    const cartLocalStorage = localStorage.getItem('cart');
    const info: CartModelPublic = cartLocalStorage ? JSON.parse(cartLocalStorage) : new CartModelPublic();

    // Check if the info variable is null or has some data in it

    if (info && info.prodData[0] && info.prodData[0].inCart !== 0) {
      // local storage is not empty and has some information
      // assign the value to our data variable which corresponds to the LocalStorage data format
      this.cartDataClient = info;
      // Loop through each entry and put it in the cartDataServer object
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProdInfo: ProductModelServer) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = p.inCart;
            this.cartDataServer.data[0].product = actualProdInfo;
            // this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            this.cartDataServer.data.push({
              numInCart: p.inCart,
              product: actualProdInfo
            });
            // this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({...this.cartDataServer});
        });
      });
    }
  }

  public addProductToCart(id: number, quantity?: number): void {
    this.productService.getSingleProduct(id).subscribe(prod => {
      // If the cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = quantity || 1;
        this.calculateTotal();
        this.cartDataClient.prodData[0].inCart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({...this.cartDataServer});
        /*this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })*/
      }  // END of IF
      // Cart is not empty
      else {
        const index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id);  // -1 or positive value

        // 1. If chosen product is already in cart array
        if (index !== -1) {

          if (quantity && quantity <= prod.quantity) {
            this.cartDataServer.data[index].numInCart =
              this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          } else {
            this.cartDataServer.data[index].numInCart =
              this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
          }

          this.cartDataClient.prodData[index].inCart = this.cartDataServer.data[index].numInCart;
          /*this.toast.info(`${prod.name} quantity updated in the cart.`, "Product Updated", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })*/
        }
        // 2. If chosen product is not in cart array
        else {
          this.cartDataServer.data.push({
            product: prod,
            numInCart: 1
          });
          this.cartDataClient.prodData.push({
            inCart: 1,
            id: prod.id
          });
          /*this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })*/
        }
        //  this.calculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        this.cartData$.next({...this.cartDataServer});
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }  // END of ELSE
    });
  }

  public updateCartData(index: number, increase: boolean): void {
    const data = this.cartDataServer.data[index];
    if (increase) {
      let inCart;
      if (data.numInCart < data.product.quantity) {
        data.numInCart++;
        inCart = data.numInCart;
      } else {
        inCart = data.product.quantity;
      }
      this.cartDataClient.prodData[index].inCart = inCart;
      // this.calculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({...this.cartDataServer});
    } else {
      data.numInCart--;
      if (data.numInCart < 1) {
        // this.deleteProductFromCart(index);
        this.cartData$.next({...this.cartDataServer});
      } else {
        this.cartData$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].inCart = data.numInCart;
        // this.calculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
  }

  public deleteProductFromCart(index: number): void {
    /*    console.log(this.cartDataClient.prodData[index].prodId);
        console.log(this.cartDataServer.data[index].product.id);*/

    // If the user doesn't want to delete the product, hits the CANCEL button
    if (!window.confirm('Are you sure you want to delete the item?')) {
      return;
    }

    this.cartDataServer.data.splice(index, 1);
    this.cartDataClient.prodData.splice(index, 1);
    // this.calculateTotal();
    this.cartDataClient.total = this.cartDataServer.total;

    if (this.cartDataClient.total === 0) {
      this.cartDataClient = new CartModelPublic();
    }
    localStorage.setItem('cart', JSON.stringify(this.cartDataClient));

    if (this.cartDataServer.total === 0) {
      this.cartDataServer = new CartModelServer();
      this.cartData$.next({...this.cartDataServer});
    } else {
      this.cartData$.next({...this.cartDataServer});
    }
  }

  private calculateTotal(): void {
    let total = 0;

    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p;
      const {price} = p.product;
      total += numInCart * price;
    });
    this.cartDataServer.total = total;
    this.cartTotal$.next(this.cartDataServer.total);
  }
}


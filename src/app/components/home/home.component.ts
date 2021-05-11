import { Component, OnInit } from '@angular/core';
import {ProductService} from '../../services/product.service';
import {ProductResponse} from '../models/products';
import {Router} from '@angular/router';
import {ProductModelServer, ServerResponse} from '../models/product.model';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: ProductModelServer[] = [];

  constructor(private productService: ProductService,
              private cartService: CartService,
              private router: Router) { }

  ngOnInit(): void {
    /*this.productService.getAllProducts().subscribe((productResponse: ProductResponse) => {
      this.products = productResponse.products;
      console.log(this.products);*/
    this.productService.getAllProducts().subscribe((prods: ServerResponse) => {
      this.products = prods.products;
      console.log(this.products);
    });
  }

  selectProduct(id: number): void {
    this.router.navigate(['/products/', id]).then();
  }

  AddToCart(id: number): void {
    this.cartService.addProductToCart(id);
  }
}

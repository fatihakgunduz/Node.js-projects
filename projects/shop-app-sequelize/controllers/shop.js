const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getHome = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render('shop/home', {
                prods: products,
                pageTitle: 'Home',
                path: '/'
            });
        })
        .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then( products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    Product.findByPk(req.params.productId)
        .then( (product) => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart=>{
            return cart.getProducts()
                .then(products=>{
                    res.render('shop/cart', {
                        path: '/cart',
                        pageTitle: 'Cart',
                        products: products
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err=>console.log(err));
};

exports.postCart = (req, res, next) => {
    let fetchedCart;
    let newQuantity = 1;

    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: {id: req.body.productId }});
        })
        .then(products => {
            if(products[0]){
                newQuantity = products[0].cartItem.quantity + 1;
                return products[0];
            }
            return Product.findByPk(req.body.productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity}
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({ where: {id: req.body.productId } });
        })
        .then(products => {
            return products[0].cartItem.destroy();
        })
        .then(result => {
            res.redirect('cart');
        })
        .catch(err=> console.log(err));
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    return order.addProducts(
                        products.map(product => {
                            product.orderItem = { quantity: product.cartItem.quantity };
                            return product;
                        })
                    );
                })
                .catch(err=> console.log(err));
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => console.log(err)); 
};

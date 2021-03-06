const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',{
        pageTitle: 'Add Poduct',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res , next) => {
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        userId: req.user
    });

    product.save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });

};

exports.getProducts = (req, res , next) => {

    Product.find()
        .then(products => {
            res.render('admin/products',{
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res , next) => {
    const edit = req.query.edit;

    if(!edit){
        return res.redirect('/');
    }

    else{

        Product.findById(req.params.productId) 
            .then(product => {
                res.render('admin/edit-product',{
                    product: product,
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: edit
                });
            })
            .catch( err => console.log(err));  
    }
};

exports.postEditProduct = (req, res , next) => {
    Product.findById(req.body.productId)
        .then(product => {
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            product.imageUrl = req.body.imageUrl;
           
            return product.save();
        })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
    Product.findByIdAndRemove(req.body.productId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};
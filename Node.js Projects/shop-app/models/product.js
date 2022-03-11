const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

var saveId = 1;

module.exports = class Product {
    
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if(this.id) {
                const existingProductIndex = products.findIndex(
                    prod => prod.id == this.id    
                );
                products[existingProductIndex] = this;
                fs.writeFile(p,JSON.stringify(products), err => {
                    console.log(err);
                });
            }
            else {
                this.id = saveId+1;
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
    }

    static fetchAll(cb){
        getProductsFromFile(cb);
    }

    static findById(id,cb){
        getProductsFromFile(products => {
            const product = products.find(pr => pr.id == id);
            console.log(product);
            return cb(product); 

        });
    }

    static deleteById(id){
        getProductsFromFile(products => {
            const productS = products.filter(pr => pr.id != id);
            fs.writeFile(p,JSON.stringify(productS), err => {
                if(!err){
                    Cart.deleteProduct(id, productS.find(prod => prod.is == id).price);
                }
            });
        });
    }

};
const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
        console.log('nfdlsçv');
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex( cp => {
            return cp.productId.toString() == product._id.toString();
        });

        if(cartProductIndex >= 0 ){
            console.log('gğnc');
            this.cart.items[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1;
        }
        else{
            this.cart.items.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: 1
            });
        }
        return db.collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this._id)},
                {$set: { cart: this.cart }}
            );
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(i => {
            return i.productId;
        });
        return db.collection('products')
            .find({_id: {$in: productIds}})
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i=> {
                                return i.productId.toString() === p._id.toString();
                            }).quantity
                    }
                });
            });
    }

    deleteItemFromCart(productId) {
        const db = getDb();
        return db.collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this.id) },
                { $set: { cart: { items: this.cart.items
                                .filter(i => {
                                    return i.productId.toString() != productId.toString(); 
                                })
                }}}
            )

    }

    addOrder() {
        const db = getDb();

        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name
                    }
                };
                return db.collection('orders').insertOne(order);
            })
            .then(result => {
                return db.collection('users')
                    .updateOne(
                        { _id: new mongodb.ObjectId(this._id) },
                        { $set: { cart: { items: [] } }}
                    );
            });
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray();
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new mongodb.ObjectId(id) })
            .then(user => {
                return user;
            })
            .catch(err => console.log(err));
    }

}

module.exports = User;
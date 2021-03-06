const mongoose = require('mongoose');
const Order = require('../model/order');
const Product = require('../model/product');
const User = require('../model/user');

exports.get_all_orders = (req, res, next) => {

    Order.find().select('_id productId quantity')
    .populate('productId', 'name')
    .exec()
        .then((result) => {
            res.status(200).json(
                {
                    message: 'Order Listed',
                    count: result.length,
                    orders: result.map(data => {
                        return {
                            _id: data._id,
                            productId: data.productId,
                            quantity: data.quantity,
                            userId: req.id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + data._id
                            }
                        }
                    })
                });
        })
}

exports.create_order = (req, res, next) => {
    Product.findById(req.body.productId).exec().then(doc => {
        if (doc) {
            const order = new Order({
                productId: req.body.productId,
                quantity: req.body.quantity,
                userId: req.id
            })
            order.save().then((result) => {
                res.status(201).json({
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                })
            });
        } else {
            res.status(404).json({
                error: 'Invalid Product Id'
            });
        }
    })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        });

}

exports.get_single_order = async (req, res, next) => {
    try {
        const id = req.params.oId;
        const accessUser = await Order.findOne({$and:[{_id: id}, {userId: req.id}]})
        if (!accessUser) {
            throw 'Access denied for this user'
        }
        Order.findById(id)
        .populate('productId')
        .exec()
            .then(result => {
                if (result) {
                    console.log(result);                
                    res.status(200).json(result);
                } else {
                    res.status(404).json({
                        error: `Invalid Order id`
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    
    } catch(error) {
        res.status(500).json({
            error
        });
    }
}

exports.update_order = (req, res, next) => {
    const id = req.params.oId;
    const updateOrders = {};
    for (const ops of req.body) {
        updateOrders[ops.propName] = ops.value
    }
    Order.update({ _id: id }, { $set: updateOrders }).exec().
        then(result => {
            res.status(200).json({
                message: 'Order updated Succesfully',
                orderDetails: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.delete_order = (req, res, next) => {
    const id = req.params.oId;
    Order.remove({ _id: id }).exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted'
            });
        })
        .catch((err => {
            res.status(500).json({
                error: err
            });
        }));
}
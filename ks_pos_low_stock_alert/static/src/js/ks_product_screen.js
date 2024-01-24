/*
    @Author: KSOLVES India Private Limited
    @Email: sales@ksolves.com
*/

odoo.define('ks_pos_low_stock_alert.ks_product_screen', function (require) {
    "use strict";
    const KsProductScreen = require('point_of_sale.ProductScreen');
    const ks_utils = require('ks_pos_low_stock_alert.utils');
    const Registries = require('point_of_sale.Registries');

    const ks_product_screen = (KsProductScreen) =>
        class extends KsProductScreen {
            _onClickPay() {
                var self = this;
                var order = self.env.pos.get_order();
                if(ks_utils.ks_validate_order_items_availability(self.env.pos.get_order(), self.env.pos.config)) {
                    var has_valid_product_lot = _.every(order.orderlines.models, function(line){
                        return line.has_valid_product_lot();
                    });
                    if(!has_valid_product_lot){
                        self.showPopup('ConfirmPopup',{
                            'title': _t('Empty Serial/Lot Number'),
                            'body':  _t('One or more product(s) required serial/lot number.'),
                            confirm: function(){
                                self.showScreen('PaymentScreen');
                            },
                        });
                    } else{
                        this.showScreen('PaymentScreen');
                    }
                }
                if(self.env.pos.config.display_popup){
                    var low_products = "";
                    var order_line;
                    for(var i = 0; i < order.get_orderlines().length ; i++) {
                        order_line = order.get_orderlines()[i];
                        if(order_line.get_product().type == 'product' && (order_line.get_product().qty_available < self.env.pos.config.minimum_stock_alert)) {
                            low_products = low_products + " " + order_line.get_product().display_name;
                        }
                    }
                    if(low_products != "") {
                        self.showPopup('ConfirmPopup',{
                            'title': self.env._t('Product low stock'),
                            'body':  _.str.sprintf(self.env._t('The following products are low of stock: %s'), low_products),
                            confirm: function(){
                                self.showScreen('PaymentScreen');
                            },
                        });
                    }
                }
        }
    };

    Registries.Component.extend(KsProductScreen,ks_product_screen);

    return KsProductScreen;
    });

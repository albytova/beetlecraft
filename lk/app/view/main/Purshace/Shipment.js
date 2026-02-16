Ext.define('beetlecraft.view.main.Purshace.Shipment', {
    extend: 'Ext.panel.Panel',
    xtype: 'shipment',

    controller: "shipment",

    INLINE_DATA: {
        profil: {
            id: null
        }
    },

    layout: {
        type: 'vbox'
    },
    flex: 1,

    border: 1,

    items: [
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: 1,
            items: [
                {
                    xtype: 'panel',
                    margin: '0 5 0 5',
                    tbar: [
                        {
                            xtype: 'button',
                            iconCls: "fas fa-sync",
                            handler: "onReloadPurchases"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-plus",
                            text: 'Добавить на склад',
                            handler: "onAddStorage"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-minus",
                            text: 'Удалить',
                            handler: "onDeleteShipment"
                        },
                        {
                            xtype: 'button',
                            text: 'Ценники',
                            handler: "onCreatePriceTags"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-bars",
                            tooltip: "Сформировать текст для SMM",
                            handler: "onGenText"
                        }
                    ],
                    layout: {
                        type: 'hbox'
                    },
                    flex: 3,
                    border: 1,
                    items: [

                        {
                            xtype: 'grid',
                            reference: 'grid_purchases',
                            margin: '5 5 5 5',
                            border: 1,

                            store: {
                                storeId: 'storePurchases',
                                autoLoad: true,
                                fields: [
                                    "order"
                                ],
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Purchases.php',
                                    extraParams: {
                                        'query': 'getPurchases'
                                    }
                                }
                            },

                            listeners: {

                                childtap : "onLoadPurchaseInfo"
                            },
                            columns: [
                                {
                                    text: 'Номер Закупки',
                                    dataIndex: 'order',
                                    flex: 3
                                }
                            ]
                        },
                        {
                            xtype: 'purchase',
                            flex: 1,
                            margin: "45 0 0 0",
                            reference: 'purchase_info',
                            border: 1,
                            isEditForm: 1,

                        }
                    ]
                }
            ]
        }

    ],

    listeners: {
        activate: "onActivate"
    }


});
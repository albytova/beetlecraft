Ext.define('beetlecraft.view.main.Purshace.Purchases', {
    extend: 'Ext.panel.Panel',
    xtype: 'purchases',

    requires: [
        'Ext.grid.Grid',
        'Ext.panel.Panel',
        'beetlecraft.view.main.Purshace.NewPurshace'
    ],

    controller: "purchases",

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
                            text: 'Открыть',
                            handler: "onOpen"
                        },
                        {
                            xtype: 'button',
                            text: 'Обновить',
                            iconCls: "fas fa-sync",
                            handler: "onReloadPurchases"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-minus",
                            text: 'Удалить закупку',
                            handler: "onDeletePurchases"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-check",
                            text: 'Утвердить',
                            handler: "onApprove"
                        }
                    ],
                    layout: {
                        type: 'hbox'
                    },
                    flex: 1,
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
                                    "order", "status", "date_zakaz"
                                ],
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Purchases.php',
                                    extraParams: {
                                        'query': 'getPurchases',
                                        'id_shop': 1
                                    }
                                }
                            },
                            flex: 1,

                            listeners: {

                                childtap : "onLoadPurchaseInfo"
                            },
                            columns: [
                                {
                                    text: 'Дата',
                                    dataIndex: 'date_zakaz',
                                    flex: 3
                                },
                                {
                                    text: 'Поставщик',
                                    dataIndex: 'supplier',
                                    flex: 3
                                },
                                {
                                    text: 'Номер Закупки',
                                    dataIndex: 'order',
                                    flex: 3
                                }
                            ]
                        },
                        {
                            xtype: 'newpurshace',
                            flex: 3,
                            margin: "45 0 0 0",
                            reference: 'purchase_info',
                            border: 1,
                            isEditForm: 1
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
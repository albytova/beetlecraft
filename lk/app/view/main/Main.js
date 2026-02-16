/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 */
Ext.define('beetlecraft.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',
    reference: 'app-main',

    requires: [
        'Ext.MessageBox',
        'Ext.layout.Fit',
        'beetlecraft.view.main.MainController'
    ],

    controller: 'main',
    viewModel: 'main',

    defaults: {
        tab: {
            iconAlign: 'top'
        }
    },

    tabBarPosition: 'top',

    layout: {
        layout: 'fit',
        align: 'stretch'
    },

    flex: 1,

    listeners: {

        "activate" : "onActivate"
    },

    items: [
        {
                title: 'База Пива',
                iconCls: 'x-fa fa-home',
                flex: 1,
                layout: 'fit',
                reference: 'tabBaseBeer',

                items: [
                    {
                        xtype: 'tabpanel',
                        tabBarPosition: 'left',
                        items: [
                            {
                                title: 'Сорта',
                                xtype: 'basebeer',
                                layout: 'fit',
                                flex: 1
                            },
                            {
                                title: 'Пивоварни',
                                xtype: 'brewery',
                                layout: 'fit',
                                flex: 1
                            },
                            {
                                xtype: 'typebeer',
                                title: 'Типы Пива',
                                layout: 'fit',
                                flex: 1
                            }
                        ]
                    }]

        },{
            title: 'Закупки',
            iconCls: 'x-fa fa-percent',
            flex: 1,
            layout: 'fit',
            items: [
                {
                    xtype: 'tabpanel',
                    tabBarPosition: 'left',
                    reference: 'tabPurchase',
                    items: [
                        {
                            title: 'Закупка',
                            xtype: 'purchase',
                            layout: 'fit',
                            flex: 1
                        },
                        {
                            title: 'Завозы',
                            xtype: 'shipment',
                            layout: 'fit',
                            flex: 1
                        },
                        // {
                        //     title: 'Закупки',
                        //     xtype: 'purchases',
                        //     layout: 'fit',
                        //     flex: 1
                        // },
                        // {
                        //     title: 'Новая Закупка',
                        //     xtype: 'newpurshace',
                        //     layout: 'fit',
                        //     flex: 1
                        // },
                        {
                            title: 'Справочник Тары',
                            xtype: 'tare',
                            layout: 'fit',
                            flex: 1
                        }
                    ]
                }]
        },{
            title: 'Склад',
            iconCls: 'x-fa fa-list',
            flex: 1,
            layout: 'fit',
            items: [
                {
                    xtype: 'tabpanel',
                    tabBarPosition: 'left',
                    items: [
                        {
                            title: 'Склад',
                            xtype: 'storage',
                            layout: 'fit',
                            flex: 1
                        }
                    ]
                }]
        },{
            title: 'Торговый зал',
            iconCls: 'x-fa fa-clipboard',
            flex: 1,
            layout: 'fit',
            items: [
                {
                    xtype: 'tabpanel',
                    tabBarPosition: 'left',
                    items: [
                        {
                            xtype: 'menudraft',
                            title: 'Краны',
                            layout: 'fit',
                            flex: 1
                        },
                        {
                            xtype: 'menubottle',
                            title: 'Бутылки',
                            layout: 'fit',
                            flex: 1
                        }
                    ]
                }
            ]
        },
        {
            title: 'Смены',
            iconCls: 'x-fa fa-money-bill',
            flex: 1,
            layout: 'fit',
            items: [
                {
                    xtype: 'tabpanel',
                    tabBarPosition: 'left',
                    items: [
                        {
                            xtype: 'shift',
                            title: 'Смены',
                            layout: 'fit',
                            flex: 1
                        },
                        {
                            xtype: 'additional',
                            title: 'Доп.товары',
                            layout: 'fit',
                            flex: 1
                        }
                    ]
                }
            ]
        },
        {
            title: 'Аналитика',
            iconCls: 'x-fa fa-calendar',
            hidden: localStorage.getItem("UserRight") == "3333" ? false : true,
            flex: 1,
            layout: 'fit',
            items: [
                {
                    xtype: 'tabpanel',
                    tabBarPosition: 'left',
                    items: [
                        {
                            xtype: 'payment',
                            title: 'Зарплата',
                            layout: 'fit',
                            flex: 1
                        },
                        {
                            xtype: 'leftovers',
                            title: 'Инвентаризация',
                            layout: 'fit',
                            flex: 1
                        }
                    ]
                }
            ]
        },
        {
            title: 'Профиль',
            iconCls: 'x-fa fa-user',
            flex: 1,
            layout: 'fit',
            items: [{
                    xtype: 'profil'
                }]
        }
    ]
});

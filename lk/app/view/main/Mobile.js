/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 */
Ext.define('beetlecraft.view.main.Mobile', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-mobile',
    reference: 'app-mobile',

    requires: [
        'Ext.MessageBox',
        'Ext.layout.Fit',
        'beetlecraft.view.main.MobileController'
    ],

    controller: 'mobile',
    viewModel: 'mobile',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    scrollable: true,
    flex: 1,

    items: [
        {
            xtype: 'container',
            reference: 'cnt_main',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            padding: 20,
            items: [

                {
                    xtype: 'datefield',
                    reference: 'dtfld_dateshift',
                    label: 'Дата смены',
                    dateFormat: 'd.m.Y',
                    value: Ext.Date.add( new Date(), Ext.Date.DAY, -1)
                },
                {
                    xtype: 'panel',
                    title: 'Остатки Кег',
                    collapsed: false,
                    collapsible: 'top',
                    flex: 1,

                    items: [

                        {
                            xtype: 'grid',
                            reference: 'grid_draft',

                            collapsed: false,
                            collapsible: 'top',

                            plugins: {
                                cellediting: true,
                                gridcellediting: {
                                    triggerEvent: 'tap',
                                    selectOnEdit: true
                                }
                            },

                            minHeight: 400,
                            store: {
                                autoLoad: true,
                                fields: [
                                    "p_id", "id_shop", "order", "id_beer", "beer_name", "beer_id", "brewery_name", "balance",
                                    {
                                        dataIndex: "numtap",
                                        type: 'number'
                                    }
                                ],
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Mobile.php',
                                    extraParams: {
                                        'query': 'getMenuDraft'
                                    }
                                }
                            },

                            columns: [
                                {
                                    text: 'Кран',
                                    dataIndex: 'numtap',
                                    width: 30
                                },
                                {
                                    text: 'Название',
                                    dataIndex: 'beer_name',
                                    flex: 1
                                },
                                {
                                    text: 'Остаток',
                                    dataIndex: 'balance',
                                    flex: 1,
                                    editable: true,
                                    editor: {
                                        xtype: 'textfield'
                                    }
                                }
                            ]

                        }
                    ]
                },
                {
                    xtype: 'panel',
                    title: 'Доп.товары',
                    collapsed: false,
                    collapsible: 'top',
                    flex: 1,

                    items: [

                        {
                            xtype: 'grid',
                            reference: 'grid_additional',

                            collapsed: false,
                            collapsible: 'top',
                            minHeight: 300,

                            plugins: {
                                cellediting: true,
                                gridcellediting: {
                                    triggerEvent: 'tap',
                                    selectOnEdit: true
                                }
                            },

                            store: {
                                autoLoad: true,
                                fields: [
                                    "id", "name"
                                ],
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Shift.php',
                                    extraParams: {
                                        'query': 'getAdditional'
                                    }
                                }
                            },

                            columns: [
                                {
                                    xtype: 'checkcolumn',
                                    dataIndex: 'is_check'
                                },
                                {
                                    text: 'Название',
                                    dataIndex: 'name',
                                    flex: 1
                                }
                            ]

                        },
                        {
                            xtype: 'textfield',
                            reference: 'txt_balon',
                            label: 'Балон',
                            labelAlign: 'left',
                            labelWidth: 150
                            //margin: '5 10 5 5'
                        },
                        {
                            xtype: 'textfield',
                            reference: 'txt_additional',
                            label: 'Дополнительно',
                            labelAlign: 'left',
                            labelWidth: 150,
                            margin: '0 0 10 0'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    title: 'Финансы',

                    collapsed: false,
                    collapsible: 'top',

                    layout: {
                        type: 'vbox'
                    },
                    padding: 5,
                    items: [
                        {
                            xtype: 'numberfield',
                            label: 'Выручка за смену',
                            labelWidth: 160,
                            value: 0,
                            reference: 'txt_all',
                            listeners: {
                                change: "onMoneyChange"
                            }
                        },
                        {
                            xtype: 'numberfield',
                            label: 'Оплата по Тиньков',
                            labelWidth: 160,
                            value: 0,
                            reference: 'txt_sber',
                            listeners: {
                                change: "onMoneyChange"
                            }
                        },
                        {
                            xtype: 'numberfield',
                            label: 'Оплата по Точке',
                            labelWidth: 160,
                            value: 0,
                            reference: 'txt_tochka',
                            listeners: {
                                change: "onMoneyChange"
                            }
                        },
                        {
                            xtype: 'numberfield',
                            label: 'Переводы',
                            labelWidth: 160,
                            value: 0,
                            reference: 'txt_transfer',
                            listeners: {
                                change: "onMoneyChange"
                            }
                        },
                        {
                            xtype: 'numberfield',
                            reference: 'txt_cash',
                            label: 'Наличными',
                            labelWidth: 160,
                            readonly: true,
                            value: 0
                        }
                    ]

                },
                {
                    xtype: 'button',
                    text: 'Закрыть смену',
                    width: '100%',
                    handler: 'onSave'
                }
            ]
        }
    ],

    listeners: {
        activate: "onActivate"
    }
});

Ext.define('beetlecraft.view.main.Store.Admission', {
    extend: 'Ext.panel.Panel',
    xtype: 'admission',

    controller: "admission",

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
                            text: 'Обновить',
                            handler: "onReloadAdmission"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-plus",
                            text: 'Добавить на склад',
                            handler: "onAddStorage"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-ban",
                            text: 'Отклонить',
                            handler: "onCancelStorage"
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
                    flex: 1,
                    border: 1,
                    items: [

                        {
                            xtype: 'grid',
                            reference: 'grid_admission',
                            margin: '5 5 5 5',
                            border: 1,

                            store: {
                                storeId: 'storeAdmission',
                                autoLoad: true,
                                fields: [
                                    "order", "status", "date_zakaz"
                                ],
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Admission.php',
                                    extraParams: {
                                        'query': 'getAdmission'
                                    }
                                }
                            },
                            flex: 1,
                            listeners: {
                                childtap: "onLoadAdmissionInfo"
                            },
                            columns: [
                                {
                                    text: 'Дата',
                                    dataIndex: 'date_zakaz',
                                    flex: 1
                                },
                                {
                                    text: 'Поставщик',
                                    dataIndex: 'supplier',
                                    flex: 1
                                },
                                {
                                    text: 'Номер Закупки',
                                    dataIndex: 'order',
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'grid',
                            reference: 'grid_admission_info',

                            margin: "0 0 0 30",
                            flex: 2,

                            store: {
                                storeId: 'storeAdmissionInfo',
                                autoLoad: true,
                                fields: [
                                    "ID", "id_shop", "order", "beer_id", "beer_name", "brewery_id", "brewery_name", "tare_name", "count", "count_fact"
                                ]
                            },

                            plugins: {
                                cellediting: true,
                                gridcellediting: {
                                    triggerEvent: 'tap', // edit on one click/tap
                                    selectOnEdit: true
                                }
                            },

                            columns: [
                                {
                                    text: 'Пивоварня',
                                    dataIndex: 'brewery_name',
                                    flex: 3
                                },
                                {
                                    text: 'Пиво',
                                    dataIndex: 'beer_name',
                                    flex: 3
                                },
                                {
                                    text: 'Тара',
                                    dataIndex: 'tare_name',
                                    flex: 3
                                },
                                {
                                    text: 'Количествво',
                                    dataIndex: 'count',
                                    flex: 3
                                }
                            ]
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
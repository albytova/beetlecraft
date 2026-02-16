Ext.define('beetlecraft.view.main.Store.Storage', {
    extend: 'Ext.panel.Panel',
    xtype: 'storage',

    requires: [
        'Ext.TabPanel'
    ],

    controller: "storage",

    layout: {
        type: 'vbox'
    },
    flex: 1,

    items: [
        {
            xtype: 'container',
            layout: {
                type: 'vbox'
            },

            items: [
                {
                    xtype: 'panel',
                    title: 'Кеги',
                    iconCls: 'x-fa fa-beer',

                    tbar: [
                        {
                            xtype: 'button',
                            iconCls: "fas fa-sync",
                            tooltip: "Обновить таблицу",
                            handler: "onReloadDraft"
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-arrow-up',
                            text: 'Поставить на кран',
                            handler: "onSetTap"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-minus",
                            tooltip: "Удалить Кег",
                            text: "Удалить",
                            handler: "onRemoveDraft"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-eye-slash",
                            reference: "btn_avail_draft",
                            tooltip: "Скрыть",
                            text: "Скрыть",
                            handler: "onHideDraft"
                        }
                    ],

                    height: 300,

                    scrollable: true,

                    items: [
                        {
                            xtype: 'grid',

                            reference: 'grid_storage_draft',

                            height: 300,

                            store: {
                                autoLoad: true,
                                storeId: 'storeStorageDraft',
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Storage.php',
                                    extraParams: {
                                        'query': 'getStorageDraft'
                                    }
                                }
                            },

                            fields: [
                                "p_id", "id_shop", "order", "id_beer", "beer_name", "beer_dist", "beer_abv", "beer_ibu", "beer_id", "brewery_name", "typebeer_name_1", "typebeer_name_2", "typebeer_name_3"
                            ],

                            columns: [
                                {
                                    text: 'Пивоварня',
                                    dataIndex: 'brewery_name',
                                    flex: 1,
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Название',
                                    dataIndex: 'beer_name',
                                    flex: 1,
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Описание',
                                    dataIndex: 'beer_dist',
                                    flex: 1,
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Крепость',
                                    dataIndex: 'beer_abv',
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Горечь',
                                    dataIndex: 'beer_ibu',
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Тип',
                                    dataIndex: 'typebeer_name_1',
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Тип',
                                    dataIndex: 'typebeer_name_2',
                                    renderer: "onRendererColumn"
                                },
                                {
                                    text: 'Тип',
                                    dataIndex: 'typebeer_name_3',
                                    renderer: "onRendererColumn"
                                }
                            ],

                            listeners: {
                                select: "onSelectGrid"
                            }
                        }
                    ]
                },

                {
                    title: 'Банки/Бутылки',
                    iconCls: 'x-fa fa-trophy',

                    xtype: 'panel',

                    flex: 1,

                    scrollable: true,

                    tbar: [

                        {
                            xtype: 'button',
                            iconCls: "fas fa-sync",
                            tooltip: "Обновить таблицу",
                            handler: "onReloadBottle"
                        },
                        {
                            xtype: 'button',
                            text: 'Переместить в Торговый Зал',
                            iconCls: 'x-fa fa-arrow-up',
                            handler: "onMoveToShop"
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-minus",
                            tooltip: "Удалить",
                            text: "Удалить",
                            handler: "onRemoveBottle"
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

                    items: [
                        {
                            xtype: 'grid',

                            reference: 'grid_storage_bottle',

                            height: 300,

                            store: {
                                autoLoad: true,
                                storeId: 'storeStorageBottle',
                                proxy: {
                                    type: 'ajax',
                                    method: 'GET',
                                    url: './php/Storage.php',
                                    extraParams: {
                                        'query': 'getStorageBottle'
                                    }
                                }
                            },

                            fields: [
                                "p_id", "id_shop", "order", "id_beer", "beer_name", "beer_dist", "beer_abv", "beer_ibu", "beer_id", "brewery_name", "typebeer_name_1", "typebeer_name_2", "typebeer_name_3"
                            ],

                            columns: [
                                {
                                    xtype: 'checkcolumn',
                                    dataIndex: 'is_check'
                                },
                                {
                                    text: 'Пивоварня',
                                    dataIndex: 'brewery_name',
                                    flex: 1
                                },
                                {
                                    text: 'Название',
                                    dataIndex: 'beer_name',
                                    flex: 1
                                },
                                {
                                    text: 'Описание',
                                    dataIndex: 'beer_dist',
                                    flex: 1
                                },
                                {
                                    text: 'Крепость',
                                    dataIndex: 'beer_abv'
                                },
                                {
                                    text: 'Горечь',
                                    dataIndex: 'beer_ibu'
                                },
                                {
                                    text: 'Объём',
                                    dataIndex: 'bottle_vol'
                                }
                            ]
                        }
                    ]
                }

            ]
        }
    ]

});
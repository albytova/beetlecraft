Ext.define('beetlecraft.view.main.BaseBeer.BaseBeer', {
    extend: 'Ext.panel.Panel',
    xtype: 'basebeer',

    requires: [
        'Ext.grid.Grid',
        'Ext.panel.Panel'
    ],

    controller: "basebeer",

    flex: 1,

    tbar: [
        {
            xtype: 'button',
            iconCls: "fas fa-sync",
            tooltip: "Обновить таблицу",
            handler: 'onReload'
        },
        {
            xtype: 'button',
            iconCls: "fas fa-plus",
            reference: 'btn_add_beer',
            tooltip: "Добавить сорт",
            handler: 'onAddBeer'
        },
        {
            xtype: 'button',
            iconCls: "fas fa-pen",
            reference: 'btn_edit_beer',
            tooltip: "Изменить сорт",
            handler: 'onEditBeer',
            disabled: true
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            reference: 'btn_delete_beer',
            tooltip: "Удалить сорт",
            handler: 'onDeleteBeer',
            disabled: true
        },
        {
            xtype: 'button',
            iconCls: "fas fa-arrow-up",
            reference: 'btn_restore_beer',
            tooltip: "Восстановить сорт",
            handler: 'onRestoreBeer',
            disabled: true
        },
        {
            xtype: 'button',
            text: 'Добавить из таблицы',
            tooltip: "Загрузить данные из таблицы Контент.База пива",
            handler: 'onAddBeerFromGoogle'
        }/*,
        {
            xtype: 'textfield',
            reference: 'txt_search',
            label: 'Найти',
            margin: '0 0 0 20',
            labelWidth: 50,
            width: 400,
            listeners: {
                'change' : 'changeSearchField'
            }
        }*/
    ],

    items: [
        {
            xtype: 'grid',

            name: 'grid_beer',
            reference: 'grid_beer',

            flex: 1,

            store: {
                autoLoad: true,
                storeId: 'storeBaseBeer',
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/BaseBeer.php',
                    extraParams: {
                        'query': 'getBaseBeer'
                    }
                }
            },

            fields: [
                "beer_id", "brewery_id", "brewery_name", "beer_name", "beer_dist", "beer_abv", "beer_ibu", "typebeer_name_1", "typebeer_name_2", "typebeer_name_3"
            ],

            plugins: {
                cellediting: true,
                gridcellediting: {
                    triggerEvent: 'doubletap', // edit on one click/tap
                    selectOnEdit: true
                }
            },

            columns: [
                {
                    dataIndex: 'brewery_name',
                    text: "Пивоварня",
                    width: 150,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'beer_name',
                    text: "Название",
                    width: 250,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'beer_dist',
                    text: "Описание",
                    width: 300,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'beer_abv',
                    text: "ABV",
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'beer_ibu',
                    text: "IBU",
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'typebeer_name_1',
                    width: 150,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'typebeer_name_2',
                    width: 150,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                },
                {
                    dataIndex: 'typebeer_name_3',
                    width: 150,
                    renderer: "onRendererColumn",
                    editable: true,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                }
            ],

            listeners: {
                select: "onSelectBeer"
            }
        }
    ]
});

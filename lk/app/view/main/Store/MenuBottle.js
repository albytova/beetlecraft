Ext.define('beetlecraft.view.main.Store.MenuBottle', {
    extend: 'Ext.panel.Panel',
    xtype: 'menubottle',

    requires: [
        'Ext.TabPanel'
    ],

    controller: "menubottle",

    title: 'Банки/Бутылки',

    tbar: [

        {
            xtype: 'button',
            iconCls: "fas fa-sync",
            tooltip: "Обновить таблицу",
            handler: "onReloadBottle"
        },
        {
            xtype: 'button',
            iconCls: "fas fa-credit-card",
            tooltip: "Продать",
            text: "Продать",
            handler: "onPayBottle"
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            tooltip: "Удалить Банку/Бутылку",
            text: "Убрать из наличия",
            handler: "onRemoveBottle"
        },
        {
            xtype: 'button',
            iconCls: "fas fa-backward",
            tooltip: "Вернуть на склад",
            text: "Вернуть на склад",
            handler: "onBackStorage"
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
        },
        {
            xtype: 'button',
            text: "Untappd",
            tooltip: "Загрузить информацию из Untappd",
            handler: "onUntappd"
        }
    ],

    items: [
        {
            xtype: 'grid',

            reference: 'grid_menu_bottle',

            flex: 1,
            scrollable: true,
            minHeight: 400,

            store: {
                autoLoad: true,
                storeId: "storeMenuBottle",
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/Menu.php',
                    extraParams: {
                        'query': 'getMenuBottle',
                        'id_shop': localStorage.getItem("ShopID")
                    }
                }
            },

            plugins: 'rowedit',

            listeners: {
                edit: "onSaveCost"
            },

            fields: [
                'is_check', "p_id", "id_shop", "order", "id_beer", "cost", "beer_name", "beer_dist", "beer_abv", "beer_ibu", "beer_id", "brewery_name"
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
                    text: 'Цена',
                    dataIndex: 'cost',
                    editable: true
                },
                {
                    text: 'Количество',
                    dataIndex: 'count'
                }
            ]
        }
    ]

});
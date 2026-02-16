Ext.define('beetlecraft.view.main.Store.MenuDraft', {
    extend: 'Ext.panel.Panel',
    xtype: 'menudraft',
    reference: 'menudraft',

    requires: [
        'Ext.TabPanel'
    ],

    controller: "menudraft",

    flex: 1,

    tbar: [
        {
            xtype: 'button',
            iconCls: "fas fa-sync",
            tooltip: "Обновить таблицу",
            handler: "onReloadDraft"
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            tooltip: "Удалить Кег",
            text: "Снять с крана",
            handler: "onRemoveTap"
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
            text: "Untappd",
            tooltip: "Загрузить информацию из Untappd",
            handler: "onUntappd"
        }
    ],

    scrollable: true,

    listeners: {
        activate: "onActivate"
    },

    items: [
        {
            xtype: 'grid',

            reference: 'grid_menu_draft',

            flex: 1,
            minHeight: 400,

            plugins: 'rowedit',
            listeners: {
                edit: "onSaveCost"
            },

            store: {
                fields: [
                    "p_id",
                    {
                        dataIndex: "numtap",
                        type: 'number'
                    }, "id_shop", "order", "id_beer", "beer_name", "beer_dist", "beer_abv", "beer_ibu", "beer_id", "brewery_name"
                ]
            }
        }
    ]

});
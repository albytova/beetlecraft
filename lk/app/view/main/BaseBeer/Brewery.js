Ext.define('beetlecraft.view.main.BaseBeer.Brewery', {
    extend: 'Ext.panel.Panel',
    xtype: 'brewery',

    requires: [
        'Ext.grid.Grid',
        'Ext.panel.Panel'
    ],

    controller: "brewery",

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
            reference: 'btn_add_brewery',
            tooltip: "Добавить пивоварню",
            handler: 'onAddBrewery'
        },
        {
            xtype: 'button',
            iconCls: "fas fa-pen",
            reference: 'btn_edit_brewery',
            tooltip: "Изменить название пивоварни",
            handler: 'onEditBrewery',
            disabled: true
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            reference: 'btn_delete_brewery',
            tooltip: "Удалить пивоварню",
            handler: 'onDeleteBrewery',
            disabled: true
        },
        {
            xtype: 'button',
            iconCls: "fas fa-arrow-up",
            reference: 'btn_restore_brewery',
            tooltip: "Восстановить пивоварню",
            handler: 'onRestoreBrewery',
            disabled: true
        },
        {
            xtype: 'button',
            text : 'Добавить из таблицы',
            tooltip: "Загрузить данные из таблицы Контент.База пива",
            handler: 'onAddBreweryFromGoogle'
        }
    ],

    flex: 1,

    items: [
        {
            xtype: 'grid',

            name: 'grid_brewery',

            flex: 1,

            store: {
                autoLoad: true,
                storeId: 'storeBrewery',
                fields: [
                    "id", "name", "UID", "status"
                ],
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/Brewery.php',
                    extraParams: {
                        'query': 'getBrewery'
                    }
                }
            },

            columns: [
                {
                    text: 'Название',
                    dataIndex: 'name',
                    flex: 1,
                    renderer: function(value, record, dataIndex, cell) {
                        if (record.data["status"] == 2)
                            cell.setStyle('color: lightgrey;')
                        else
                            cell.setStyle('color: black;');
                        return value;
                    }
                }
            ],

            hideHeaders: true,

            listeners: {
                select: "onSelectBrewery"
            }
        }
    ]



});

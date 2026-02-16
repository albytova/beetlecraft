Ext.define('lk.view.main.Admin', {
    extend: 'Ext.tab.Panel',
    xtype: 'admin',
    name: 'admin',

    requires: [
        'lk.view.main.ListBeer',
        'lk.view.main.AdminController',
        'lk.view.main.Price',
        'lk.view.main.admin.Present'
    ],

    controller: 'admin',

    items: [
        {
            xtype: 'grid',
            title: 'Задачи',
            name: 'gridTasks',
            store: {
                fields: ["id", "name", "draft_name", "draft_brewery", "draft_cost300", "draft_cost500"]
            },
            selModel: {
                selType: 'checkboxmodel',
                listeners: {
                    select: "checkTask",
                    mode: 'MULTI'
                }
            },
            viewConfig : {
                enableTextSelection: true
            },
            tbar: [
                {
                    xtype: 'button',
                    text: 'Обновить',
                    handler: 'loadTasks'
                }
            ],
            columns: [
                {
                    dataIndex: "name",
                    width: 200,
                    editable: true
                },
                {
                    dataIndex: "beer_name",
                    width: 200
                },
                {
                    dataIndex: "beer_brewery",
                    width: 100
                },
                {
                    dataIndex: "draft_cost300",
                    width: 50
                },
                {
                    dataIndex: "draft_cost500",
                    width: 50
                }
            ]
        },
        {
            xtype: 'price',
            title: 'Цены'
        }
        // {
        //     xtype: 'listusers',
        //     title: 'Карты'
        // }
    ],

    initComponent: function() {
        this.callParent(arguments);
        this.getController().loadTasks();
    }
});
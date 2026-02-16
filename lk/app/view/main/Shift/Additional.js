Ext.define('beetlecraft.view.main.Shift.Additional', {
    extend: 'Ext.panel.Panel',

    xtype: 'additional',
    controller: "additional",

    tbar: [
        {
            xtype: 'button',
            iconCls: "fas fa-plus",
            tooltip: "Добавить",
            handler: 'onAdd'
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            tooltip: "Удалить",
            handler: 'onDelete'
        }
    ],

    items: [
        {
            xtype: 'container',
            layout: 'vbox',
            items: [
                {
                    xtype: 'grid',

                    name: 'grid_additional',
                    reference: 'grid_additional',

                    flex: 2,
                    width: '100%',

                    plugins: {
                        rowedit: true
                    },

                    hideHeaders: true,

                    columns: [
                        {
                            dataIndex: 'name',
                            editable: true,
                            editor: {
                                xtype: 'textfield'
                            },
                            flex: 1,
                            hideHeaders: true
                        }
                    ],

                    listeners: {
                        edit: "onEdit"
                    },

                    store: {
                        autoLoad: true,
                        storeId: 'storeAdditional',
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
                    }
                }
            ]
        }

    ]

});
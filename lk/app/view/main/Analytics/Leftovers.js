Ext.define('beetlecraft.view.main.Analytics.Leftovers', {
    extend: 'Ext.panel.Panel',
    xtype: 'leftovers',

    controller: "leftovers",

    flex: 1,
    layout: 'vbox',

    tbar: [
        {
            xtype: 'formpanel',
            reference: 'form_loadfile',
            items: [
                {
                    xtype: 'fieldset',
                    reference: 'fld_loadfile',
                    title: false,
                    flex: 1,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'button',
                            iconCls: "fas fa-sync",
                            tooltip: "Обновить таблицу",
                            handler: "onReloadBottle"
                        },
                        {
                            xtype: 'filefield',
                            label: "Остатки из 1С",
                            name: 'leftovers_file',
                            accept: '.xlsx',
                            margin: '5 5 5 5'
                        },
                        {
                            xtype: 'button',
                            text: "Загрузить",
                            handler: "onLoadDataFrom1C",
                            margin: '5 5 5 5'
                        },
                        {
                            xtype: 'button',
                            reference: "btn_opis",
                            text: "Сформировать опись",
                            //disabled: true,
                            handler: "onFormingOpis",
                            margin: '5 5 5 5'
                        },
                        {
                            xtype: 'button',
                            reference: "btn_save",
                            text: "Сохранить",
                            hidden: true,
                            handler: "onFinishInventr",
                            margin: '5 5 5 5'
                        },
                        {
                            xtype: 'button',
                            reference: "btn_cancel",
                            text: "Отмена",
                            hidden: true,
                            handler: "onCancelInventr",
                            margin: '5 5 5 5'
                        }
                    ]
                }
            ]
        }
    ],

    items: [
        {
            xtype: 'grid',
            reference: 'grid_leftovers',

            plugins: 'rowedit',
            listeners: {
                edit: "onSaveCountBase"
            },

            store: {
                autoLoad: true,
                storeId: 'storeLeftovers',
                fields: ["id", "brewery_name", "name", "count_base", "count_1c", "status_text"],
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/Leftovers.php',
                    extraParams: {
                        'query': 'getMenuBottle'
                    }
                }
            },

            columns: [
                {
                    dataIndex: 'brewery_name',
                    text: 'Пивоварня',
                    align: "left",
                    width: 150
                },
                {
                    dataIndex: 'beer_name',
                    text: 'Сорт',
                    align: "left",
                    width: 300
                },
                {
                    dataIndex: 'count_base',
                    text: 'База',
                    align: "center",
                    width: 70,
                    editable: true
                },
                {
                    dataIndex: 'count_1c',
                    text: '1С',
                    align: "center",
                    width: 70
                },
                {
                    dataIndex: 'status_text',
                    text: 'Статус',
                    align: "left",
                    width: 200
                }
            ]
        }
        ]

});

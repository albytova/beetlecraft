Ext.define('lk.view.main.ListBeer', {
    extend: 'Ext.tab.Panel',
    xtype: 'listbeer',
    reference: 'listbeer',
    controller: 'listbeer',
    name: 'listbeer',

    title: 'Пиво',

    items: [
        {
            title: 'Пиво',
            xtype: 'grid',
            name: 'gridBeer',
            tbar: [
                {
                    text: 'Добавить'
                },
                {
                    text: 'Удалить'
                },
                {
                    text: 'Заполнить из Untuppd'
                }
            ],
            store: {
                proxy: {
                    type: 'ajax',
                    url: "./php/classes/QueryBeer.php?query=getBeer",
                    reader: {
                        type: 'json'
                    }
                },

                autoLoad: true
            },
            flex: 1,
            columns: [
                {
                    title: 'Пивоварня',
                    dataIndex: 'brewery_name',
                    flex: 1
                },
                {
                    title: 'Название',
                    dataIndex: 'name',
                    flex: 1
                }
            ],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                flex: 1,
                items: [
                    {
                        xtype: 'panel',
                        layout: {
                            type: 'table',
                            columns: 2
                        },
                        items: [
                            {
                                xtype: 'panel',
                                layout: {
                                    align: 'fit'
                                },
                                columnWidth: .25,
                                flex: 1,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        emptyText: 'Название',
                                        margin: '1 0 0 0',
                                        width: 300
                                    }
                                ]
                            },
                                            {
                                                xtype: 'panel',
                                                layout: {
                                                    type: 'hbox'
                                                },
                                                flex: 1,
                                                columnWidth: .75,
                                                items: [
                                                    {
                                                        xtype: 'combobox',
                                                        width: 150
                                                    },
                                                    {
                                                        xtype: 'combobox',
                                                        width: 150
                                                    },
                                                    {
                                                        xtype: 'combobox',
                                                        width: 150
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'panel',
                                                layout: {
                                                    type: 'hbox'
                                                },
                                                items: [
                                                    {
                                                        xtype: 'combobox',
                                                        width: 265
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        text: 'U',
                                                        style: {
                                                            background: "#ecc912"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                xtype: 'panel',
                                                layout: {
                                                    type: 'hbox',
                                                    align: 'stretch'
                                                },
                                                flex: 1,
                                                items: [
                                                    {
                                                        xtype: 'textfield',
                                                        emptyText: 'ABV',
                                                        width: 60
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        emptyText: 'OG',
                                                        width: 60
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        emptyText: 'IBU',
                                                        width: 60
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        emptyText: 'Объём',
                                                        width: 70
                                                    },
                                                    {
                                                        xtype: 'textfield',
                                                        emptyText: 'Untuppd',
                                                        width: 100
                                                    },
                                                    {
                                                        xtype: 'button',
                                                        text: 'Сохранить',
                                                        width: 100
                                                    }
                                                ]
                                            },

                        ]
                    }

                    //     /*
                    //     * name
                    //         brewery
                    //         brewery_untuppd
                    //         typebeer1
                    //         typebeer2
                    //         typebeer3
                    //         abv
                    //         og
                    //         ibu
                    //         untuppd
                    //         vol
                    //     * */
                    // }
                ]
            }]
        },
        {
            title: 'Пивоварни',
            xtype: 'grid',
            name: 'gridBrewery',
            tbar: [
                {
                    text: 'Добавить',
                    handler: 'onAddBrewery'
                },
                {
                    text: 'Удалить',
                    handler: 'onRemoveBrewery'
                }
            ],
            store: {
                proxy: {
                    type: 'ajax',
                    url: "./php/classes/QueryBeer.php?query=getBrewery",
                    reader: {
                        type: 'json'
                    }
                },

                autoLoad: true
            },
            flex: 1,
            columns: [
                {
                    title: 'Название',
                    dataIndex: 'name',
                    flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    title: 'Untuppd',
                    dataIndex: 'untuppd',
                    flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true
                    }
                }
            ],
            selModel: 'rowmodel',
            plugins: {
                rowediting: {
                    clicksToEdit: 2
                }
            },
            listeners: {
                edit: 'onEditBrewery'
            }
        },
        {
            title: 'Типы',
            xtype: 'grid',
            name: 'gridTypeBeer',
            tbar: [
                {
                    text: 'Добавить',
                    handler: 'onAddTypeBeer'
                },

                {
                    text: 'Удалить',
                    handler: 'onRemoveTypeBeer'
                }
            ],
            store: {
                fields: ["id", "name"],
                proxy: {
                    type: 'ajax',
                    url: "./php/classes/QueryBeer.php?query=getTypeBeer",
                    reader: {
                        type: 'json'
                    }
                },

                autoLoad: true
            },
            flex: 1,
            columns: [
                {
                    title: 'Тип',
                    dataIndex: 'name',
                    flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                }
            ],
            selModel: 'rowmodel',
            plugins: {
                rowediting: {
                    clicksToEdit: 2
                }
            },
            listeners: {
                edit: 'onEditTypeBeer'
            }
        }
    ],


    initComponent: function() {
        const main = this;
        main.callParent(arguments);

        const grid_brewery = main.down("[name=gridBrewery]");
        grid_brewery.store.load();
    }

    //
    // tbar: [
    //     {
    //         text: 'Добавить',
    //         handler: 'onInput'
    //     },
    //     {
    //         text: 'Изменить',
    //         handler: 'onEdit'
    //     },
    //     {
    //         xtype: 'button',
    //         text: 'Обновить',
    //         handler: 'onUpdate'
    //     }
    // ],

    // plugins: {
    //     rowediting: {
    //         clicksToMoveEditor: 2,
    //         autoCancel: true,
    //         saveBtnText: "Сохранить",
    //         cancelBtnText: "Отменить"
    //     }
    // },

    // columns: [
    //     {
    //         header: '<div>Номер</div><div>карты</div>',
    //         dataIndex: 'num'
    //     },
    //     {
    //         text: 'Имя',
    //         dataIndex: 'name',
    //         editor: {
    //             allowBlank: false
    //         }
    //     },
    //     {
    //         text: 'Фамилия',
    //         dataIndex: 'surname',
    //         editor: {
    //             allowBlank: false
    //         }
    //     },
    //     {
    //         text: 'Телефон',
    //         dataIndex: 'phone',
    //         editor: {
    //             allowBlank: false
    //         }
    //     },
    //     {
    //         xtype: 'datecolumn',
    //         text: '<div>Дата</div><div>рождения</div>',
    //         dataIndex: 'birthday',
    //         format: 'd.m.Y',
    //         editor: {
    //             xtype: 'datefield',
    //             allowBlank: false,
    //             format: 'd.m.Y',
    //             minValue: '01/01/1950',
    //             maxValue: Ext.Date.format(new Date(), 'd.m.Y')
    //         }
    //     },
    //     {
    //         text: 'untuppd',
    //         dataIndex: 'untuppd',
    //         editor: {
    //             allowBlank: true
    //         }
    //     },
    //     {
    //         xtype: 'booleancolumn',
    //         header:'<div>Зареги-</div><div>стрирован</div><div>на сайте?</div>',
    //         dataIndex: 'is_reg',
    //         trueText: 'Да',
    //         falseText: ''
    //     },
    //     {
    //         header: '<div>Внесён</div><div>в 1С?</div>',
    //         dataIndex: 'in1c',
    //         renderer: function(v) {
    //             if (v === 1)
    //                 return 'Да';
    //             return '';
    //         }
    //     }
    // ]

});

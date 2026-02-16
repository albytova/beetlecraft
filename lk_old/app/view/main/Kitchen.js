Ext.define('lk.view.main.Kitchen', {
    extend: 'Ext.panel.Panel',
    xtype: 'kitchen',
    reference: 'kitchen',
    controller: 'kitchen',
    name: 'kitchen',

    title: 'Кухня',

    flex: 1,
    autoScroll: true,

    requires: [
        'lk.view.main.zamedlenie.WinCreateDraft'
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        flex: 1,
        items: [
            {
                xtype: 'button',
                name: 'btnDisabled',
                text: "Загрузить таблицу",
                disabled: true,
                handler: 'onReset'
            },
            {
                xtype: 'button',
                text: "Отправить заказ",
                handler: 'onSend'
            }
        ]
    }],

            items: [
                {
                    xtype: 'tabpanel',
                    bodyPadding: 5,
                    items: [
                        {
                          xtype: 'panel',
                            title: 'Продукты',
                          items: [
                              {
                                  xtype: 'label',
                                  name: 'lblResult'
                              },
                              {
                                  xtype: 'grid',
                                  name: 'gridProducts',
                                  columnLines: true,
                                  allowDeselect: true,
                                  autoScroll: true,
                                  scrollable: true,
                                  store: {
                                      fields: ['id', 'name', 'type']
                                  },
                                  selModel: {
                                      mode: 'MULTI',
                                      selType: 'checkboxmodel'
                                  },
                                  columns: [
                                      {
                                          dataIndex: 'name',
                                          flex: 3
                                      },
                                      {
                                          dataIndex: 'place',
                                          flex: 1
                                      }
                                  ]
                              }
                          ]
                        },
                        {
                            xtype: 'panel',
                            title: 'Кеги',
                            items: [
                                {
                                    xtype: 'panel',
                                    bodyPadding: 2,
                                    items: [
                                        {
                                            xtype: 'button',
                                            text: 'Поставить на кран',
                                            handler: 'onSetTap'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-trash',
                                            margin: '0 0 0 5',
                                            handler: 'onDeleteDraft'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-plus-circle',
                                            margin: '0 0 0 5',
                                            handler: 'onAddDraft'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'far fa-edit',
                                            margin: '0 0 0 5',
                                            handler: 'onEditDraft'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-retweet',
                                            margin: '0 0 0 5',
                                            handler: 'onReloadDraft'
                                        },
                                        {
                                            xtype: 'button',
                                            text: 'smm',
                                            margin: '0 0 0 5',
                                            handler: 'onSetDateSMM'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'grid',
                                    name: 'gridDraft',
                                    store: {
                                        fields: ["num", "num_view", "name", "brewery", "dist", "abv", "date_smm", "coin_300", "coin_500"]
                                    },
                                    columns: [
                                        {
                                            dataIndex: 'num_view',
                                            width: 50,
                                            sorting: true
                                        },
                                        {
                                            dataIndex: 'name',
                                            width: 200
                                        },
                                        {
                                            dataIndex: 'brewery',
                                            width: 150
                                        },
                                        {
                                            dataIndex: 'dist',
                                            width: 150
                                        },
                                        {
                                            dataIndex: 'abv',
                                            width: 50
                                        },
                                        {
                                            dataIndex: 'coin_300',
                                            width: 50
                                        },
                                        {
                                            dataIndex: 'coin_500',
                                            width: 50
                                        },
                                        {
                                            dataIndex: 'date_smm',
                                            width: 100
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            title: 'Бутылки/Банки',
                            items: [
                                {
                                    xtype: 'panel',
                                    bodyPadding: 2,
                                    items: [
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-trash',
                                            margin: '0 0 0 5',
                                            handler: 'onDeleteBottle'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-plus-circle',
                                            margin: '0 0 0 5',
                                            handler: 'onAddBottle'
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls: 'x-fa fa-retweet',
                                            margin: '0 0 0 5',
                                            handler: 'onReloadBottle'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'grid',
                                    name: 'gridBottle',
                                    store: {
                                        fields: ["brewery_name", "beer_name", "cost"]
                                    },
                                    selModel: {
                                        mode: 'MULTI',
                                        selType: 'checkboxmodel'
                                    },
                                    columns: [
                                        {
                                            dataIndex: 'brewery_name',
                                            width: 150
                                        },
                                        {
                                            dataIndex: 'beer_name',
                                            width: 300
                                        },
                                        {
                                            dataIndex: 'cost',
                                            width: 50
                                        }
                                    ],
                                    listeners: {
                                        select: 'selectBottleRow'
                                    }
                                },
                                {
                                    xtype: 'label',
                                    name: 'lblBottleDist',
                                    text: ''
                                }
                            ]
                        }
                    ]
                }

    ],

    initComponent: function() {
        this.callParent(arguments);
        this.getController().load();
    }
})
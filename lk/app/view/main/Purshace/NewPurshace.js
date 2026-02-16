Ext.define('beetlecraft.view.main.Purshace.NewPurshace', {
    extend: 'Ext.panel.Panel',
    xtype: 'newpurshace',
    name: 'newpurshace',

    controller: "newpurshace",

    INLINE_DATA: {
        tare: {},
        is_acivate: false,
        is_edit: false
    },

    flex: 1,

    items: [
        {
            xtype: 'container',
            layout: 'vbox',

            items: [
                {
                    xtype: 'panel',
                    layout: 'hbox',
                    margin: '15 0 0 20',
                    items: [
                        {
                            xtype: 'textfield',
                            label: 'Поставщик',
                            labelWidth: '80px',
                            reference: 'txt_supplier',
                            width: 350
                        },
                        {
                            xtype: 'button',
                            text: 'Сохранить Закупку',
                            iconCls: "fas fa-save",
                            margin: '0 0 0 10',
                            handler: 'onSavePurshace'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    margin: '10 5 0 5',
                    collapsed: false,
                    collapsible: 'top',
                    title: 'Состав Заказа',
                    tbar: [
                        {
                            xtype: 'button',
                            iconCls: "fas fa-plus",
                            tooltip: 'Добавить строку',
                            handler: 'onAddRecord'
                        },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-minus",
                            tooltip: 'Удалить строку',
                            handler: 'onDeleteRecord'
                        },
                        {
                            xtype: 'textfield',
                            label: 'Стоимость доставки',
                            margin: '0 0 0 20',
                            labelWidth: '135px',
                            placeholder: '0 руб',
                            reference: 'txt_ship'
                        },
                        {
                            xtype: 'button',
                            text: 'Рассчитать',
                            iconCls: "fas fa-percent",
                            handler: 'onCalculate'
                        }
                    ],

                    layout: {
                        type: 'vbox'
                    },

                    flex: 2,

                    items: [

                        {
                            xtype: 'grid',
                            reference: 'grid_purshace',
                            margin: '5 5 5 5',

                            store: {
                                fields: [
                                    "id_beer", "id_tare"
                                ]
                            },
                            flex: 1,
                            minHeight: "200px",

                            scrollable: true,

                            plugins: {
                                cellediting: true,
                                rowedit: true,
                                gridcellediting: {
                                    triggerEvent: 'tap',
                                    selectOnEdit: true
                                }
                            },

                            height: '400px'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    margin: '0 5 0 5',
                    layout: {
                        type: 'vbox'
                    },
                    flex: 2,

                    collapsed: false,
                    collapsible: 'top',
                    title: 'Расчетные Цены',

                    items: [
                        {
                            xtype: 'grid',
                            reference: 'grid_purshace_result',
                            margin: '5 5 5 5',

                            store: {
                                fields: [
                                    "id_beer", "cost_liter", "bottle_cost"
                                ]
                            },

                            height: '400px',

                            plugins: {
                                cellediting: true,
                                gridcellediting: {
                                    triggerEvent: 'tap', // edit on one click/tap
                                    selectOnEdit: true
                                }
                            },

                            columns: [
                                {
                                    text: '',
                                    dataIndex: 'counter',
                                    width: 20
                                },
                                {
                                    text: 'Сорт',
                                    dataIndex: 'id_beer',
                                    flex: 3,
                                    editable: true,
                                    editor: {
                                        xtype: 'textfield',
                                        readOnly: true
                                    }
                                },

                                {
                                    text: 'Себестоимость Литра/Бутылки',
                                    dataIndex: 'cost_liter',
                                    flex: 1,
                                    editable: false
                                }

                            ]
                        }
                    ]
                }

            ]
        }

    ],

    listeners: {
        activate: "onActivate",
        painted: "onShow",
        focusleave: "onSaveTmp"
    }


});
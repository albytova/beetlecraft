Ext.define('beetlecraft.view.main.Purshace.Purchase', {
    extend: 'Ext.panel.Panel',
    xtype: 'purchase',
    name: 'purchase',

    controller: "purchase",

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
            flex: 1,

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
                            readOnly: true,
                            width: 350
                        },
                        {
                            xtype: 'textfield',
                            label: 'Стоимость доставки',
                            margin: '0 0 0 20',
                            labelWidth: '135px',
                            placeholder: '0 руб',
                            readOnly: true,
                            reference: 'txt_ship'
                        },
                        {
                            xtype: 'button',
                            text: 'Закрыть',
                            iconCls: "fas fa-save",
                            margin: '0 0 0 10',
                            handler: 'onClosePurshace'
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    margin: '10 5 0 5',
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
                            minHeight: "500px",

                            scrollable: true,

                            plugins: {
                                cellediting: true,
                                rowedit: true,
                                gridcellediting: {
                                    triggerEvent: 'tap',
                                    selectOnEdit: true
                                }
                            },

                            //layout: 'fit'
                            //height: '400px'
                        }
                    ]
                }

            ]
        }

    ],

    listeners: {
        activate: "onActivate",
        painted: "onShow",
        edit: 'onEditRecord'
    }


});
Ext.define('beetlecraft.view.main.Shift.Shift', {
    extend: 'Ext.panel.Panel',
    xtype: 'shift',

    controller: "shift",

    layout: {
        type: 'vbox'
    },
    flex: 1,

    listeners: {
        activate: "onActivate"
    },

    InlineData: {
        "date_shift" : null,
        "id_shift" : null,
        "money_cash_at_box" : 0,
        "new_money_all": 0,
        "new_money_sber" : 0,
        "new_money_tochka" : 0,
        "new_money_transfer" : 0,
        "new_money_credit_all" : 0
    },

    tbar: [


                        {
                            xtype: 'button',
                            text: "Изъять из кассы",
                            reference: 'btn_out_box',
                            iconCls: "fas fa-arrow-up",
                            tooltip: "Изъять наличные кассы",
                            handler: 'onOutBox'
                        },
                        // {
                        //     xtype: 'button',
                        //     text: "Долги",
                        //     reference: 'btn_credit',
                        //     tooltip: "Показать долги",
                        //     handler: 'onCredit'
                        // },
                        {
                            xtype: 'button',
                            iconCls: "fas fa-money-bill",
                            reference: 'btn_cash_to_box',
                            tooltip: "Установить количество наличных в кассе",
                            handler: 'onCashToBox'
                        },
                        {
                            xtype: 'label',
                            html: '',
                            flex: 1
                        },
                        {
                            xtype: 'label',
                            html: 'В кассе: ',
                            reference: 'lbl_main_cash_box',
                            style: {
                                "font-size": "13pt"
                            }
                        }


    ],
    bodyPadding: 10,
    items: [
        {
            xtype: 'container',
            layout: {
                type: 'hbox'
            },

            items: [
                {
                    xtype: 'grid',

                    reference: 'grid_shift',

                    minWidth: "250px",
                    minHeight: "600px",

                    columns: [
                        {
                            text: 'Дата смены',
                            dataIndex: 'date_shift',
                            flex: 1,
                            align: "right",
                            
                            renderer: function(value, record, dataIndex, cell) {

                                value = value.substring(0, 10);

                                let dt_shift = new Date(value);

                                dt_shift = Ext.Date.format(dt_shift, 'd F [D]');

                                if (record.data["is_close"] === '1')
                                    dt_shift = "☑ " + dt_shift;

                                if (record.data["is_load_leftover"] === '0')
                                    dt_shift = "● " + dt_shift;

                                return dt_shift;
                            }
                        }
                    ],

                    store: {
                        storeId: 'storeShift',
                        fields: [
                            "id", "date_shift"
                        ]
                    },

                    listeners: {

                        childtap : "onLoadShiftInfo"
                    }
                },
                {
                    xtype: 'panel',

                    flex: 1,
                    bodyPadding: 10,
                    items: [
                        {
                            xtype: 'panel',
                            reference: 'pnl_new_shift',
                            flex: 1,
                            hidden: true,
                            tbar: [

                            ],
                            items: [

                                {
                                    xtype: 'label',
                                    reference: 'lbl_new_date_shift'
                                },
                                {
                                    xtype: 'numberfield',
                                    labelWidth: "140px",
                                    label: 'Выручка за смену',
                                    value: 0,
                                    reference: 'lbl_new_money_all',
                                    listeners: {
                                        change: "onMoneyChange"
                                    }

                                },
                                {
                                    xtype: 'numberfield',
                                    label: 'Оплата по Сберу',
                                    labelWidth: "140px",
                                    value: 0,
                                    reference: 'lbl_new_money_sber',
                                    listeners: {
                                        change: "onMoneyChange"
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    label: 'Оплата по Точке',
                                    labelWidth: "140px",
                                    value: 0,
                                    reference: 'lbl_new_money_tochka',
                                    listeners: {
                                        change: "onMoneyChange"
                                    }
                                },
                                {
                                    xtype: 'numberfield',
                                    label: 'Переводы',
                                    labelWidth: "140px",
                                    value: 0,
                                    reference: 'lbl_new_money_transfer',
                                    listeners: {
                                        change: "onMoneyChange"
                                    }
                                },
                                {
                                    xtype: 'label',
                                    reference: 'lbl_cash_shift',
                                    margin: "20 5 10 5",
                                    style: {
                                        "font-size": "13pt"
                                    },
                                    html: "Наличными за смену: "
                                },
                                {
                                    xtype: 'button',
                                    text: 'Закрыть смену',
                                    margin: 5,
                                    iconCls: 'x-fa fa-circle',
                                    handler: "onCloseShift"
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            reference: 'pnl_close_shift',
                            flex: 1,
                            bodyPadding: 10,
                            hidden: true,
                            items: [
                                {
                                    xtype: 'label',
                                    reference: 'lbl_close_date_shift'
                                },
                                {
                                    xtype: 'formpanel',
                                    reference: 'form_loadfile',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            reference: 'fld_loadfile',
                                            title: false,
                                            flex: 1,
                                            layout: 'hbox',
                                            border: 0,
                                            items: [
                                                {
                                                    xtype: 'filefield',
                                                    label: "Отчет о продажах",
                                                    reference: 'fld_text_loadfile',
                                                    name: 'sales_file',
                                                    accept: '.xlsx',
                                                    labelWidth: 120,
                                                    fieldWidth: 200,
                                                    margin: '5 5 5 5'
                                                },
                                                {
                                                    xtype: 'button',
                                                    text: "Загрузить",
                                                    handler: "onLoadSalesFile",
                                                    margin: '5 5 5 5'
                                                },
                                            ]
                                        },

                                        {
                                            xtype: 'checkbox',
                                            boxLabel: 'Отправить отчет',
                                            reference: 'check_sendchannel',
                                            inputValue: '1', // Value to submit when checked
                                            checked: true // Initial state (optional)
                                        }
                                    ]
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'Выручка за смену',
                                    reference: 'lbl_close_money_all',
                                    labelWidth: "140px",
                                    clearable: false,
                                    editable: false
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'Оплаты наличными',
                                    reference: 'lbl_close_money_cash',
                                    labelWidth: "140px",
                                    clearable: false,
                                    editable: false
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'Оплаты картами',
                                    reference: 'lbl_close_money_acquiring',
                                    labelWidth: "140px",
                                    clearable: false,
                                    editable: false
                                },
                                {
                                    xtype: 'textfield',
                                    label: 'Переводы',
                                    labelWidth: "140px",
                                    reference: 'lbl_close_money_transfer',
                                    clearable: false,
                                    editable: false
                                },
                                // {
                                //     xtype: 'textfield',
                                //     label: 'Долги',
                                //     labelWidth: "140px",
                                //     reference: 'lbl_close_money_credit',
                                //     clearable: false,
                                //     editable: false
                                // },
                                // {
                                //     xtype: 'textfield',
                                //     label: 'Депозиты',
                                //     labelWidth: "140px",
                                //     reference: 'lbl_close_money_debet',
                                //     clearable: false,
                                //     editable: false
                                // },
                                {
                                    xtype: 'textfield',
                                    label: 'Бармен',
                                    reference: 'lbl_close_barmen',
                                    labelWidth: "140px",
                                    clearable: false,
                                    editable: false
                                }
                            ]
                        }
                    ]
                }

            ]
        }
    ]

});
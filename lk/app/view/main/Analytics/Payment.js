Ext.define('beetlecraft.view.main.Analytics.Payment', {
    extend: 'Ext.panel.Panel',
    xtype: 'payment',

    controller: "payment",

    flex: 1,

    tbar: [
        {
            xtype: 'button',
            text: "ЗП за последнюю неделю",
            handler: "onSendPaymentWeek"
        }
    ],

    items: [
        {
            xtype: 'grid',
            reference: 'grid_payment',

            plugins: {
                cellediting: true,
                gridcellediting: {
                    triggerEvent: 'doubletap',
                    selectOnEdit: true
                }
            },

            flex: 1,

            store: {
                autoLoad: true,
                storeId: 'storePayment',
                fields: ["id", "date_shift", "money_all",  "barman", "payment"]
            },

            columns: [
                {
                    dataIndex: 'date_shift',
                    text: 'Смена',

                    width: 200,
                    align: "right",

                    renderer: function(value, record, dataIndex, cell) {

                        let dt_shift = new Date(value);

                        dt_shift = Ext.Date.format(dt_shift, 'd F [D]');
                        return dt_shift;
                    }
                },
                {
                    dataIndex: 'money_all',
                    text: 'Выручка',
                    align: "center",
                    width: 200
                },
                {
                    dataIndex: 'barman',
                    text: 'Бармен',
                    align: "center",
                    width: 200
                },
                {
                    dataIndex: 'payment',
                    text: 'ЗП',
                    align: "center",
                    width: 300,
                    editor: {
                        xtype: 'textfield',
                        readOnly: true
                    }
                }
            ]
        }
        ],

    listeners: {
        activate: "onActivate"
    }

});

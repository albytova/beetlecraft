Ext.define('lk.view.main.Price', {
    extend: 'Ext.panel.Panel',
    xtype: 'price',
    reference: 'price',
    controller: 'price',
    name: 'price',

    title: 'Цены',

    flex: 1,
    autoScroll: true,

    items: [
        {
            xtype: 'label',
            html: '<h2>Рассчёт цен</h2>'
        },
        {
            xtype: 'label',
            html: 'Введите номера строк'
        },
        {
            xtype: 'container',
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype: 'numberfield',
                    name: 'fieldRow1',
                    fieldLabel: 'Строка 1',
                    labelWidth: 70
                },
                {
                    xtype: 'numberfield',
                    name: 'fieldRow2',
                    fieldLabel: 'Строка 2',
                    labelWidth: 70
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
                    xtype: 'button',
                    text: 'Загрузить',
                    handler: 'onLoad'
                },
                {
                    xtype: 'button',
                    text: 'Выгрузить в базу Замедления',
                    margin: '0 0 0 5',
                    handler: 'onPush'
                }
            ]
        },
        {
            xtype: 'panel',
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype: 'label',
                    name: 'lblDistr',
                    html: '<br>'
                },
                {
                    xtype: 'grid',
                    name: 'gridPrice',
                    width: '100%',
                    height: '50%',
                    store: {
                        fields: ['namebrew', 'count', 'type', 'price1', 'price2', 'price3', 'price4', 'price5'],
                        data: [
                            {
                                name: ''
                            }
                        ]
                    },
                    columns: [
                        {
                            dataIndex: 'namebrew',
                            width: 180,
                            title: 'Название'
                        },
                        {
                            dataIndex: 'price1',
                            width: 60
                        },
                        {
                            dataIndex: 'price2',
                            width: 60
                        },
                        {
                            dataIndex: 'price3',
                            width: 60
                        },
                        {
                            dataIndex: 'price4',
                            width: 60,
                            renderer:function(value,metaData){
                                metaData.style="color:darkred;font-weight:bold;";
                                return value;
                            }
                        },
                        {
                            dataIndex: 'price5',
                            width: 60,
                            renderer:function(value,metaData){
                                metaData.style="color:darkred;font-weight:bold;";
                                return value;
                            }
                        }
                    ]
                }
            ]
        }
    ],

    initComponent: function() {
        const main = this;
        main.callParent(arguments);

        const gridProducts = main.down("[name=gridProducts]");

        // Ext.Ajax.request({
        //     method: 'GET',
        //     url: './php/classes/QueryKitchen.php',
        //     params : {
        //         'query' : 'getProducts'
        //     },
        //     success: function(result) {
        //         if (result && result.status == 200) {
        //             const data = JSON.parse(result.responseText);
        //             let dataObj = [];
        //             for (let i = 0; i < data.length; i++) {
        //                 dataObj.push({
        //                     name: data[i][0],
        //                     type: data[i][1]
        //                 })
        //             }
        //             gridProducts.getStore().loadData(dataObj);
        //         }
        //     },
        //     failure: function(result) {
        //         console.log(result);
        //     }
        // })
    }
})
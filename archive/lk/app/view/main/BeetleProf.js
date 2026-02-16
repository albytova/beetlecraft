Ext.define('lk.view.main.BeetleProf', {
    extend: 'Ext.panel.Panel',
    xtype: 'beetleprof',
    reference: 'beetleprof',
    controller: 'beetleprof',
    name: 'beetleprof',

    title: 'Закупки',

    flex: 1,
    autoScroll: true,

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
            xtype: 'label',
            name: 'lblResult',
            html: ''
        },
        {
            xtype: 'grid',
            name: 'gridProducts',
            title: 'Закупки',
            columnLines: true,
            allowDeselect: true,
            autoScroll: true,
            scrollable: true,
            store: {
                fields: ['name', 'type']
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
                    dataIndex: 'type',
                    flex: 1
                }
            ]
        }
    ],

    initComponent: function() {
        const main = this;
        main.callParent(arguments);

        const gridProducts = main.down("[name=gridProducts]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryBeetleProf.php',
            params : {
                'query' : 'getProducts'
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);
                    let dataObj = [];
                    for (let i = 0; i < data.length; i++) {
                        dataObj.push({
                            name: data[i][0],
                            type: data[i][1]
                        })
                    }
                    gridProducts.getStore().loadData(dataObj);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        })
    }
})
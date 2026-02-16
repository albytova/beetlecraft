Ext.define('beetlecraft.view.main.Purshace.WinPurchasesController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.winpurchases',

    onShow: function () {

        const me = this;
        const grid = me.getView().lookupReference("grid_purchase");

        grid.setColumns( [
            {
                text: '',
                dataIndex: 'counter',
                width: 20
            },
            {
                text: 'Пивоварня',
                dataIndex: 'brewery_name',
                editable: true,
                editor: {
                    xtype: 'textfield',
                    readOnly: true
                }
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
                text: 'Общая стоимость',
                dataIndex: 'cost',
                flex: 1,
                editable: true,
                editor: {
                    xtype: 'textfield'
                }
            }
        ] );

        for (let i = 0; i < me.getView().genColumns.length; i++) {
            grid.addColumn(me.getView().genColumns[i]);
        }

        grid.getStore().loadData(me.getView().initData);
    },

    /* Загрузка списка пив из Базы */
    closeWin: function () {

        const me = this;

        me.getView().destroy();
    }
});

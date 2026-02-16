Ext.define('lk.view.main.admin.PresentController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.present',

    load: function () {
        const gridPresent = this.getView().down("[name=gridPresent]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryKitchen.php',
            params : {
                'query' : 'getPresent'
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);

                    gridPresent.getStore().loadData(data);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    onReload: function () {
        this.load();
    },

    onUse: function () {
        const gridPresent = this.getView().down("[name=gridPresent]");
        const me = this;

        let selectRow = gridPresent.getSelection();
        if (selectRow.length === 0)
            return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryKitchen.php',
            params : {
                'query' : 'deletePresent',
                'id': selectRow[0]['id']
            },
            success: function(result) {
                if (result && result.status == 200) {
                    me.load();
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    }
});
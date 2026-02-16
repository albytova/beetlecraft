Ext.define('beetlecraft.view.main.Shift.AdditionalController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.additional',

    onAdd: function () {

        const me = this;

        Ext.Msg.prompt('Добавление доп.товара', 'Введите название', function(buttonId, text) {

                if (buttonId != 'ok')
                    return;

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Shift.php',
                    params : {
                        'query' : 'addAdditional',
                        'name' : text
                    },
                    success: function() {

                        Ext.data.StoreManager.lookup("storeAdditional").reload();
                    },
                    failure: function(result) {
                        console.log("ERROR: " + result.responseText);
                    }
                })

        })
    },

    onDelete: function () {

        const me = this;
        const gridAdditional = me.getView().lookupReference("grid_additional");
        const selectedRecord = gridAdditional.getSelection();

        if (!selectedRecord)
            return;

        Ext.Msg.show({
            title: 'Внимание',
            message: "Вы действительно хотите удалить " + selectedRecord.data["name"] + "?",
            buttons: [
                {
                    text:'Да',
                    itemId:'yes'
                },
                {
                    text:'Нет',
                    itemId:'no'
                }
                ],
            fn: function (btn) {
                if (btn === 'yes') {

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Shift.php',
                        params : {
                            'query' : 'deleteAdditional',
                            'id' : selectedRecord.data["id"]
                        },
                        success: function(result) {

                            Ext.data.StoreManager.lookup("storeAdditional").reload();
                        },
                        failure: function(result) {
                            console.log("ERROR: " + result.responseText);
                        }
                    })
                }
            }
        })

    },

    onEdit: function(grid, location) {

        const data = location.record.data;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Shift.php',
            params : {
                'query' : 'editAdditional',
                'name' : data["name"],
                'id' : data["id"]
            },
            success: function(result) {

                Ext.data.StoreManager.lookup("storeAdditional").reload();
            },
            failure: function(result) {
                console.log("ERROR: " + result.responseText);
            }
        })

        location.record.commit();
    }
});
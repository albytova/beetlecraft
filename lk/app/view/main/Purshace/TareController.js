Ext.define('beetlecraft.view.main.Purshace.TareController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.tare',

    /* Создание хранилища тары */
    createStoreTare: function () {

        const me = this;

        const storeTare = Ext.data.StoreManager.lookup("storeTare");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Tare.php',
            params : {
                'query': 'getTare',
                'id_shop': localStorage.getItem("ShopID")
            },
            success: function(result) {
                if (result && result.status == 200) {

                    storeTare.loadData(JSON.parse(result.responseText));
                }
            },
            failure: function(result) {
                console.log(result);
            }
        })

        const gridTare = this.getView().down("[name=grid_tare]");

        gridTare.setStore(storeTare);
    },

    /* Добавление тары */
    onAddTare: function () {

        const me = this;

        Ext.Msg.prompt('Добавление Тары', 'Введите название Тары', function(buttonId, text) {

                if (buttonId != 'ok')
                    return;

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Tare.php',
                    params : {
                        'query' : 'addTare',
                        'name' : text,
                        'id_shop' : 1
                    },
                    success: function() {

                        me.createStoreTare();
                    },
                    failure: function(result) {
                        console.log("ERROR: " + result.responseText);
                    }
                })

        })
    },

    /* Удаление тары */
    onDeleteTare: function () {

        const me = this;
        const grid = this.getView().down("[name=grid_tare]");
        var selectedRecord = grid.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Тара не выбрана");
            return;
        }

        Ext.Msg.show({
            title: 'Внимание',
            message: "Вы действительно хотите удалить Тару " + selectedRecord.data["name"] + "?",
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
                        url: './php/Tare.php',
                        params : {
                            'query' : 'deleteTare',
                            'id' : selectedRecord.data["ID"]
                        },
                        success: function(result) {

                            me.createStoreTare();
                        },
                        failure: function(result) {
                            console.log("ERROR: " + result.responseText);
                        }
                    })
                }
            }
        })

    },

    /* Редактирование тары */
    onEdit: function(grid, location) {

        const data = location.record.data;
        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Tare.php',
            params : {
                'query' : 'editTare',
                'name' : data["name"],
                'id' : data["ID"],
                'formula' : data["formula"],
                'count_unit' : data["count_unit"]? data["count_unit"] : "null",
                'type' : data["type"]
            },
            success: function(result) {
                me.createStoreTare();
            },
            failure: function(result) {
                console.log("ERROR: " + result.responseText);
            }
        })

        location.record.commit();
    }
});
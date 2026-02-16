Ext.define('beetlecraft.view.main.BaseBeer.BreweryController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.brewery',

    /* Загрузка списка пивоварен из Базы */
    onReload: function () {

        const gridBrewery = this.getView().down("[name=grid_brewery]");
        gridBrewery.getStore().reload();
    },

    /* Добавление пивоварни */
    onAddBrewery: function () {

        const me = this;

        Ext.Msg.prompt('Добавление пивоварни', 'Укажите название пивоварни', function(r, brewery) {

            if (!brewery)
                return;

            const is_b = me.isHasBrewery(brewery);
            if (is_b) {
                Ext.Msg.alert('Добавление пивоварни', 'Пивоварня <b>' + brewery + '</b> уже создана');
                return;
            }

            me.createNewBreweries([brewery]);
        })

    },

    /* Редактирование пивоварни */
    onEditBrewery: function () {

        const me = this;
        const gridBrewery = me.getView().down("[name=grid_brewery]");

        let selectedRecord = gridBrewery.getSelection();

        if (!selectedRecord)
            return;

        Ext.Msg.prompt('Редактирование пивоварни', 'Укажите название пивоварни', function(r, brewery) {

            if (!brewery)
                return;

            const is_b = me.isHasBrewery(brewery);
            if (is_b) {
                Ext.Msg.alert('Редактирование пивоварни', 'Пивоварня <b>' + brewery + '</b> уже создана');
                return;
            }

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Brewery.php',
                params : {
                    'query' : 'editBrewery',
                    'id' : selectedRecord.data["id"],
                    'name' : brewery
                },
                success: function(result) {
                    gridBrewery.getStore().reload();
                },
                failure: function(result) {
                    console.log("ERROR: " + brewery + "-> " + result.responseText);
                }
            })

        })

    },

    /* Добавление пивоварен из Google-таблицы */
    onAddBreweryFromGoogle: function () {

        const me = this;
        me.getView().setMasked( {
                xtype: 'loadmask',
                message: 'Загрузка'
        });

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Brewery.php',
            params : {
                'query' : 'getBreweryFromGoogle'
            },
            success: function(result) {
                if (result && result.status == 200) {

                    let data = JSON.parse(result.responseText);
                    me.createNewBreweries(data);
                }
                else
                    me.getView().unmask();
            },
            failure: function(result) {
                console.log("ERROR: " + result.responseText);
                me.getView().unmask();
            }
        })
    },

    /* Создание новых пивоварен: data - массив названий */
    createNewBreweries: function (data) {

        const gridBrewery = this.getView().down("[name=grid_brewery]");

        for (let i = 0; i < data.length; i++) {

            const brewery = data[i];

            const is_b = this.isHasBrewery(brewery);
            if (is_b) {

                Ext.Msg.alert('Добавление пивоварни', 'Пивоварня <b>' + brewery + '</b> уже создана');
                continue;
            }

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Brewery.php',
                params : {
                    'query' : 'addBrewery',
                    'name' : brewery
                },
                success: function(result) {
                    gridBrewery.getStore().reload();
                },
                failure: function(result) {
                    console.log("ERROR: " + brewery + "-> " + result.responseText);
                }
            })
        }
        this.getView().unmask();
    },

    /* Поиск пивоварни по названию */
    isHasBrewery: function (name) {

        const storeBrewery = Ext.data.StoreManager.lookup("storeBrewery");
        const breweries = storeBrewery.getData().items;

        for (let i = 0; i < breweries.length; i++) {
            if (breweries[i].data["name"].toLowerCase() == name.toLowerCase())
                return true;
        }

        return false;
    },

    /* Удаление пивоварни */
    onDeleteBrewery: function () {
        const gridBrewery = this.getView().down("[name=grid_brewery]");
        let selectedRecord = gridBrewery.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Пивоварня не выбрана");
            return;
        }

        Ext.Msg.show({
            title: 'Внимание',
            message: "Вы действительно хотите удалить пивоварню " + selectedRecord.data["name"] + "?",
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
                        url: './php/Brewery.php',
                        params : {
                            'query' : 'deleteBrewery',
                            'id' : selectedRecord.data["id"]
                        },
                        success: function(result) {

                            gridBrewery.getStore().reload();
                        },
                        failure: function(result) {
                            console.log("ERROR: " + result.responseText);
                        }
                    })
                }
            }
        })
    },

    /* Восстановление пивоварни */
    onRestoreBrewery: function () {

        const me = this;

        const gridBrewery = this.getView().down("[name=grid_brewery]");
        let selectedRecord = gridBrewery.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Пивоварня не выбрана");
            return;
        }

        Ext.Msg.show({
            title: 'Внимание',
            message: "Вы действительно хотите восстановить пивоварню " + selectedRecord.data["name"] + "?",
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
                        url: './php/Brewery.php',
                        params : {
                            'query' : 'restoreBrewery',
                            'id' : selectedRecord.data["id"]
                        },
                        success: function(result) {
                            gridBrewery.getStore().reload();
                        },
                        failure: function(result) {
                            console.log("ERROR: " + result.responseText);
                        }
                    })
                }
            }
        })
    },

    /* Обработка события выделения записи */
    onSelectBrewery: function ( grid, selected) {

        let is_active_brewery = true;

        if (selected[0].data["status"] == 2)
            is_active_brewery = false;

        this.getView().lookupReference("btn_edit_brewery").setDisabled(!is_active_brewery);
        this.getView().lookupReference("btn_delete_brewery").setDisabled(!is_active_brewery);
        this.getView().lookupReference("btn_restore_brewery").setDisabled(is_active_brewery);
    }
});

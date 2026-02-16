Ext.define('beetlecraft.view.main.BaseBeer.BaseBeerController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.basebeer',

    /* Загрузка списка пив из Базы */
    onReload: function () {

        const gridBeer = this.getView().down("[name=grid_beer]");
        gridBeer.getStore().reload();
    },

    /* Отображение содержимого колонки */
    onRendererColumn: function(value, record, dataIndex, cell) {

        if (dataIndex == 'beer_abv' && value)
            value = value + "%";

        if (dataIndex == 'beer_ibu' && value)
            value = "IBU " + value;

        if (record.data["status"] == 2)
            cell.setStyle('color: lightgrey;')
        else
            cell.setStyle('color: black;');
        return value;
    },

    /* Создание сорта */
    onAddBeer: function () {

        const me = this;
        Ext.create({
            xtype: 'beer',
            title: 'Создание сорта',
            isHasBeer: this.isHasBeer,
            listeners: {
                destroy: function () {
                    me.onReload();
                }
            }
        }).show()
    },

    /* Редактирование сорта */
    onEditBeer: function () {

        const gridBeer = this.getView().down("[name=grid_beer]");
        let selectedRecord = gridBeer.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Сорт не выбран");
            return;
        };

        const me = this;
        const winBeer = Ext.create({
            xtype: 'beer',
            title: 'Редактирование сорта',
            isHasBeer: this.isHasBeer,
            listeners: {
                destroy: function () {
                    me.onReload();
                }
            }
        }).show()
        winBeer.getController().setEditBeer(selectedRecord.data);
    },

    /* Удаление сорта */
    onDeleteBeer: function () {

        const gridBeer = this.getView().down("[name=grid_beer]");
        let selectedRecord = gridBeer.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Сорт не выбран");
            return;
        }

        Ext.Msg.show({
            title: 'Внимание',
            message: "Вы действительно хотите удалить сорт <b>" + selectedRecord.data["beer_name"] + " [" + selectedRecord.data["brewery_name"] + "]</b> ?",
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
                        url: './php/BaseBeer.php',
                        params : {
                            'query' : 'deleteBeer',
                            'beer_id' : selectedRecord.data["beer_id"]
                        },
                        success: function(result) {

                            gridBeer.getStore().reload();
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
    onRestoreBeer: function () {

        const me = this;

        const gridBeer = this.getView().down("[name=grid_beer]");
        let selectedRecord = gridBeer.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Сорт не выбран");
            return;
        }

        Ext.Msg.show({
            title: 'Удаление сорта',
            message: "Вы действительно хотите восстановить сорт <b>" + selectedRecord.data["beer_name"] + " [" + selectedRecord.data["brewery_name"] + "]</b> ?",
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
                        url: './php/BaseBeer.php',
                        params : {
                            'query' : 'restoreBeer',
                            'beer_id' : selectedRecord.data["beer_id"]
                        },
                        success: function(result) {
                            gridBeer.getStore().reload();
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
    onSelectBeer: function ( grid, selected) {

        let is_active_beer = true;

        if (selected[0].data["status"] == 2)
            is_active_beer = false;

        this.getView().lookupReference("btn_edit_beer").setDisabled(!is_active_beer);
        this.getView().lookupReference("btn_delete_beer").setDisabled(!is_active_beer);
        this.getView().lookupReference("btn_restore_beer").setDisabled(is_active_beer);
    },

    /* Загрузка сортов из Google-таблицы Контент.База пива */
    onAddBeerFromGoogle: function () {

        const me = this;

        me.getView().setMasked( {
            xtype: 'loadmask',
            message: 'Загрузка'
        });

        Ext.Ajax.request({
            method: 'GET',
            url: './php/BaseBeer.php',
            params : {
                'query' : 'getBeerFromGoogle'
            },
            success: function(result) {

                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);

                    me.createNewBrews(data);
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

    /* Изменение содержимого поля поиска */
    changeSearchField: function (field, value) {

        const val = this.getView().lookupReference("txt_search").getValue();
        const storeBeer = Ext.data.StoreManager.lookup("storeBaseBeer");

        storeBeer.filter(new Ext.util.Filter({

            filterFn: function(item) {
                console.log(val);

                // if (item.data["beer_name"].search(val) !== -1) {
                //
                //     console.log(item.data["beer_name"]);
                //     console.log(item.data["beer_name"].search(val));
                //     console.log(val);
                //
                //     return true;
                // }

                return false;
            }
        }));

         this.getView().lookupReference("grid_beer").refresh();
    },

    /* Создание новых пивоварен */
    createNewBrews: function (data) {

        const me = this;
        const dataBrewery = Ext.data.StoreManager.lookup("storeBrewery").getData().items;

        let brews = [];
        for (let i = 1; i < data.length; i++) {
            if (brews.indexOf(data[i][0]) < 0)
                brews.push(data[i][0]);
        }

        let newBrews = [];
        for (let j = 0; j < brews.length; j++) {
            const brewery = brews[j];
            let rez = false;
            for (let i = 0; i < dataBrewery.length; i++) {
                if (brewery == dataBrewery[i].data["name"]) {
                    rez = true;
                }
            }
            if (!rez)
                newBrews.push(brewery);
        }

        if (newBrews.length == 0) {
            me.createNewBeers(data);
            return;
        }

        Ext.Msg.confirm('Внимание', 'Пивоварни <b>' + newBrews.join(", ") + '</b> не созданы. Вы хотите их создать?', function (buttonId) {

            if (buttonId != 'yes') {
                me.createNewBeers(data);
                return;
            }

            for (let j = 0; j < newBrews.length; j++) {

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Brewery.php',
                    params: {
                        'query': 'addBrewery',
                        'name': newBrews[j]
                    },
                    success: function (result) {
                        Ext.Msg.alert("Внимание", "Добавлена пивоварня " + newBrews[j]);
                        me.createNewBeers(data);
                    },
                    failure: function (result) {
                        console.log("ERROR: " + brewery + "-> " + result.responseText);
                    }
                })
            }
        })
    },

    /* Создание новых сортов */
    createNewBeers: function (data) {

        const gridBeer = this.getView().down("[name=grid_beer]");
        let arrNumRow = [], arrExistBeer = [];

        for (let i = 1; i < data.length; i++) {

            const beer = data[i];

            if (!beer[0] || !beer[1] || !beer[2] || !beer[3] || !beer[8]) {
                arrNumRow.push(i);
                continue;
            }

            const is_b = this.isHasBeer(beer[1], beer[0]);
            if (is_b) {
                arrExistBeer.push(beer[1] + ' [' + beer[0] + ']');
                continue;
            }

            Ext.Ajax.request({
                method: 'GET',
                url: './php/BaseBeer.php',
                params : {
                    'query' : 'addBeer',
                    'brewery' : beer[0],
                    'name' : beer[1],
                    'dist' : beer[2],
                    'type_1' : beer[3],
                    'type_2' : beer[4],
                    'type_3' : beer[5],
                    'ABV' : beer[6]? beer[6].replace(",", ".") : 'null',
                    'IBU' : beer[7]? beer[7] : 'null',
                    'UID' : beer[8]
                },
                success: function(result) {
                    //gridBeer.getStore().reload();
                },
                failure: function(result) {
                    console.log("ERROR: " + beer + "-> " + result.responseText);
                }
            })
        }

        let textMessage = "";
        if (arrNumRow.length > 0) {
            textMessage += 'Строка №' + arrNumRow.join(", ") + ' не добавлена. Заполнены не все поля<br><br>';
        }
        if (arrExistBeer.length > 0) {
            textMessage += 'Такие сорта уже созданы:<br><br>' + arrExistBeer.join(",<br>");
        }
        if (textMessage != "")
            Ext.Msg.alert('Добавление сорта', textMessage);

        const grid = this.getView().down("[name=grid_beer]");
        grid.getStore().reload();
        this.getView().unmask();
    },


    /* Поиск сорта по названию и пивоварне */
    isHasBeer: function (beer, brewery) {

        const storeBeer = Ext.data.StoreManager.lookup("storeBaseBeer");
        const beers = storeBeer.getData().items;

        for (let i = 0; i < beers.length; i++) {
            if (beers[i].data["beer_name"].toLowerCase() == beer.toLowerCase() && beers[i].data["brewery_name"].toLowerCase() == brewery.toLowerCase())
                return true;
        }

        return false;
    }
    
});

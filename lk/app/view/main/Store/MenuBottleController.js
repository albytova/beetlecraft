Ext.define('beetlecraft.view.main.Store.MenuBottleController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.menubottle',

    /* Создание ценников */
    onCreatePriceTags: function () {

        const dataMenuBottle = Ext.data.StoreManager.lookup("storeMenuBottle").getData().items;

        let bbData = [];

        for (let i = 0; i < dataMenuBottle.length; i++) {
            if (dataMenuBottle[i].data["is_check"]) {
                console.log(dataMenuBottle[i].data);
                bbData.push(dataMenuBottle[i].data["purchase_id"]);
            }
        }

        if (bbData.length === 0)
            return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Storage.php',
            params: {
                'query': 'createPriceTags',
                'ids': bbData.join(",")
            },
            success: function (result) {

                console.log(result);

            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    /* Получение информации из Untappd */
    onUntappd: function () {

        const me = this;
        const dataMenuBottle = Ext.data.StoreManager.lookup("storeMenuBottle").getData().items;

        let uid = "", style = "";

        for (let i = 0; i < dataMenuBottle.length; i++) {
            if (dataMenuBottle[i].data["is_check"]) {
                uid = dataMenuBottle[i].data["beer_uid"];
                style = dataMenuBottle[i].data["beer_dist"];
                break;
            }
        }

        if (uid.length === 0)
            return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Menu.php',
            params: {
                'query': 'getUntappd',
                'BID': uid
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);
                const beer_link = "https://untappd.com/b/"+ddData["beer_slug"]+"/"+uid;

                let message = "<b><u>" + ddData["name"] + " от " + ddData["brewery"] + "</u></b>\n\n";
                message += "<i>" + style + "\n";
                message += "ABV " + ddData["abv"] + "% " + (ddData["ibu"]? " IBU " + ddData["ibu"] : "") + " <a href='"+beer_link+"'>Untappd " + ddData["rating"] +"</a></i>\n\n";
                message += ddData["description"] + "\n\n";

                me.sendTelegram(message, ddData["beer_label_hd"], true);
                Ext.Msg.alert('Untappt', 'Сообщение отправлено в SMM');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },


    sendTelegram: function (message, photo, is_admin) {

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': is_admin? 'sendMessageTGAdmin' : 'sendMessageTG',
                'message': message,
                'photo': photo,
                'document': null
            },
            success: function (result) {
                console.log("Сообщение отправлено");
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        });
    },

    onSaveCost: function(grid, location) {

        const item = location.record.data;

        if (!item.cost) {
            Ext.Msg.alert("Внимание", "Цена не может быть пустой!");
            this.onReloadBottle();
            return;
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Menu.php',
            params: {
                'query': 'saveBottleCost',
                'cost_id': item["cost_id"]? item["cost_id"] : -1,
                'id_tare': item["id_tare"],
                'p_id': item["purchase_id"],
                'cost': item.cost
            },
            success: function (result) {
                console.log('update cost');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        });

        location.record.commit();
    },

    /* Удаление бутылок */
    onRemoveBottle: function () {

        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_menu_bottle");
        let recs = gridMenuBottle.getStore().getData().items;

        let bbData = [];

        for (let i = 0; i < recs.length; i++) {
            if (recs[i].data["is_check"])
                bbData.push(recs[i].data);
        }

        if (bbData.length == 0)
            return;

        Ext.Msg.confirm('Удаление бутылок', 'Вы действительно хотите вернуть на склад выбранные позиции?', function(ans) {

            if (ans != 'yes')
                return;

            Ext.Object.eachValue(bbData, function (bottle) {

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Menu.php',
                    params: {
                        'query': 'removeBottle',
                        'id_menu': bottle["id"]
                    },
                    success: function (result) {
                        gridMenuBottle.getStore().reload();
                    },
                    failure: function (result) {
                        Ext.Msg.alert(result.responseText);
                    }
                })
            })

        });
    },

    onBackStorage: function () {

        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_menu_bottle");
        let recs = gridMenuBottle.getStore().getData().items;

        let bbData = [];

        for (let i = 0; i < recs.length; i++) {
            if (recs[i].data["is_check"])
                bbData.push(recs[i].data);
        }

        if (bbData.length == 0)
            return;

        Ext.Msg.confirm('Возврат бутылок', 'Вы действительно хотите вернуть выбранные позиции на склад?', function(ans) {

            if (ans != 'yes')
                return;

                Ext.Object.eachValue(bbData, function (bottle) {

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Menu.php',
                        params: {
                            'query': 'rewertBottle',
                            'id_purchase': bottle["purchase_id"]
                        },
                        success: function (result) {
                            gridMenuBottle.getStore().reload();

                            me.sendTelegram(bottle["beer_name"] + " возвращен на склад");
                        },
                        failure: function (result) {
                            Ext.Msg.alert(result.responseText);
                        }
                    })
                })
        });
    },

    /* Продать бутылку */
    onPayBottle: function () {

        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_menu_bottle");

        let selectedRecord = gridMenuBottle.getSelection();

        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Сорт не выбран");
            return;
        };

        Ext.Msg.prompt(
            'Продажа банки/бутылки',
            'Сколько штук продано?',
            function (buttonId, value) {

                if (buttonId != "ok")
                    return;

                let new_count = parseInt(selectedRecord.data["count"]) - parseInt(value);

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Menu.php',
                    params : {
                        'query' : 'payBottle',
                        'id' : selectedRecord.data["id"],
                        'count_bottle' : new_count
                    },
                    success: function() {

                        gridMenuBottle.getStore().reload();
                    },
                    failure: function(result) {
                        console.log("ERROR: " + result.responseText);
                    }
                })
            },
            null,
            false,
            "1",
            {
                autoCapitalize: true,
                placeHolder: 'First-name please...'
            }
        );

        console.log(selectedRecord.data);
    },

    /* Обновить таблицу бутылок */
    onReloadBottle: function () {
        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_menu_bottle");
        gridMenuBottle.getStore().reload();
    },

    /* Формирование текста для соцсетей */
    onGenText: function () {

        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_menu_bottle");
        let recs = gridMenuBottle.getStore().getData().items;

        let bbData = [];

        for (let i = 0; i < recs.length; i++) {
            if (recs[i].data["is_check"])
                bbData.push(recs[i].data["purchase_id"]);
        }

        if (bbData.length == 0)
            return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': 'getForGenTextByIDs',
                'ids': bbData.join(",")
            },
            success: function (result) {

                const ddData = JSON.parse(result.responseText);
                let ddObj = {};

                for (let i = 0; i < ddData.length; i++) {

                    const brewery = ddData[i]["brewery_name"];
                    if (!ddObj[ brewery ])
                        ddObj[ brewery ] = [];

                    ddObj[ brewery ].push("= " + ddData[i]["beer_name"] + " / " + ddData[i]["beer_dist"]);
                }

                let text = "Ловите завоз ⤵️\n";
                for (let brew in ddObj) {
                    text += "\n" + brew + "\n";
                    ddObj[brew].forEach(function(item, i, arr) {
                        text += item + "\n";
                    });
                }
                text += "\nАктуальное наличие @beetlecraft_bot";

                me.sendTelegram(text, false, true);
                Ext.Msg.alert('Untappt', 'Сообщение отправлено в SMM');

            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    }
});
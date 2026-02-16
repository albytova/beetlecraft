Ext.define('beetlecraft.view.main.Analytics.LeftoversController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.leftovers',


    onLoadDataFrom1C: function () {

        const me = this;

        let form = me.getView().lookupReference("form_loadfile");


        form.submit({
            url: './php/Leftovers.php',
            method: 'GET',
            waitMsg: 'Загрузка файла...',
            params: {
                'query': 'loadFile'
            },
            success: function(form, action) {
                let response = action.result;

                if (action.success) {

                    console.log('Полученные данные:', action.data);

                    const resultArray = Ext.Array.filter(Object.values(action.data), function(item) {
                        return Array.isArray(item) && item.length >= 2 &&
                            Ext.Array.some(item, function(cell) {
                                return String(cell || '').toLowerCase().indexOf('шт') !== -1;
                            });
                    }).map(function(item) {
                        return {
                            name: (item[0] || '').replace(/\s*,\s*,\s*шт\s*/gi, "").trim(),
                            count_1c: Number(item[1]) || 0
                        };
                    });
                    console.log(resultArray);
                    me.loadDataFromBase(resultArray);

                } else {
                    Ext.Msg.alert('Ошибка', action.message);
                }
            },
            failure: function(form, action) {
                Ext.Msg.alert('Ошибка', 'Ошибка загрузки');
            }
        });

    },

    loadDataFromBase: function (data1C) {

        const me = this;
        const gridLeftovers = me.getView().lookupReference("grid_leftovers");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Leftovers.php',
            params: {
                'query': 'getMenuBottle'
            },
            success: function (result) {

                const dataBase = JSON.parse(result.responseText);

                // За основу берем arr_base и добавляем count_1c из resultArray
                const mergedArray = dataBase.map(baseItem => {
                     const resultItem = data1C.find(item => item.name.toLowerCase() === baseItem.beer_name.toLowerCase());
                    return {
                        ...baseItem,
                        count_1c: resultItem ? resultItem.count_1c : 0
                    };
                });

                gridLeftovers.getStore().loadData(mergedArray);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    onFormingOpis: function () {

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Leftovers.php',
            params: {
                'query': 'createAkt'
                //'query': 'debugMatching'
            },
            success: function(response) {

                let filename = response.responseText;
                window.open(
                    './php/' + filename.trim(),
                    '_blank' // <- This is what makes it open in a new window.
                );

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Leftovers.php',
                    params: {
                        'query': 'deleteFile',
                        'filename': filename.trim()
                    },
                    success: function(response) {

                        console.log(response.responseText);
                    },
                    failure: function() {
                        Ext.Msg.alert('Ошибка', 'Не удалось удалить файл');
                    }
                });
            },
            failure: function() {
                Ext.Msg.alert('Ошибка', 'Не удалось сформировать акт');
            }
        });
    },

    reloadFromBase: function () {

        const me = this;

        me.getView().lookupReference("btn_inventr").setHidden(false);
        me.getView().lookupReference("btn_save").setHidden(true);
        me.getView().lookupReference("btn_cancel").setHidden(true);
    },

    /* Обновить таблицу бутылок */
    onReloadBottle: function () {
        const me = this;
        const gridMenuBottle = me.getView().lookupReference("grid_leftovers");
        gridMenuBottle.getStore().reload();
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

    onSaveCountBase: function (grid, location) {

        const
            me = this,
            item = location.record.data;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Leftovers.php',
            params: {
                'query': 'saveCountBottleBase',
                'count_base': item["count_base"]? item["count_base"] : 0,
                'id_purchase': item["p_id"]
            },
            success: function (result) {

                const message = "Изменено количество бутылок " + item["beer_name"] + " - " + item["count_base"] + " шт";

                console.log(message);
                //me.sendTelegram(message);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        });

        location.record.commit();
    }
});

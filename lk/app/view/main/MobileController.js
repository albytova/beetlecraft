Ext.define('beetlecraft.view.main.MobileController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.mobile',

    onActivate: function () {

        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Mobile.php',
            params: {
                'query': 'getLastShift'
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);
                let dtLastShift = new Date( ddData[0]["date_shift"]);

                dtLastShift = Ext.Date.add(dtLastShift, Ext.Date.DAY, 1);

                me.getView().lookupReference("dtfld_dateshift").setValue( dtLastShift );
                localStorage.setItem("Cash", ddData[0]["cash"]);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    onSave: function () {

        let message = "";

        const me = this;
        const dtShift = me.getView().lookupReference("dtfld_dateshift").getValue();
        const gridDraft = me.getView().lookupReference("grid_draft");
        const dataDraft = gridDraft.getStore().getData().items;

        message += "<b>Смена от " + Ext.Date.format(dtShift, 'd.m.Y') + "\n\n<u>Остатки:</u></b>";

        //Сохранение остатков кег и формирование информации по остаткам кег
        for (let i = 0; i < dataDraft.length; i++) {

            message += "\n" + dataDraft[i].data["numtap"] + ". " + dataDraft[i].data["beer_name"] + ": " + dataDraft[i].data["balance"] + " [" + dataDraft[i].data["tare_name"] + "]";

            Ext.Ajax.request ({
                method: 'GET',
                url: './php/Mobile.php',
                params: {
                    'query': 'saveDraftBalance',
                    'balance': dataDraft[i].data["balance"],
                    'id': dataDraft[i].data["m_id"]
                },
                success: function (result) {

                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            });
        }

        setTimeout( function () {

            const count_empty = 10 - dataDraft.length;
            if (count_empty > 0)
                message += "\n\n<i>Пустых кранов " + count_empty + "</i>";

            me.getStorageInfo(message);
        }, 1000);

    },

    //Формирование информации о кегах на складе
    getStorageInfo: function (message) {

        const me = this;
        const dtShift = me.getView().lookupReference("dtfld_dateshift").getValue();

        message += "\n\n<b><u>Кеги на складе:</u></b>";

        Ext.Ajax.request ({
            method: 'GET',
            url: './php/Mobile.php',
            params: {
                'query': 'getDraftStorage'
            },
            success: function (result) {

                const dtStorage = JSON.parse(result.responseText);
                for (let i = 0; i < dtStorage.length; i++) {
                    message += "\n" + dtStorage[i]["beer_name"] + " [" + dtStorage[i]["tare_name"] + "]";
                }

                me.getAdditionalInfo(message);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        });
    },

    //Формирования списка дополнительных товаров
    getAdditionalInfo: function (message) {

        const me = this;

        const gridAdditional = me.getView().lookupReference("grid_additional");
        const txtBalon = me.getView().lookupReference("txt_balon");
        const txtAdditional = me.getView().lookupReference("txt_additional");

        let recs = gridAdditional.getStore().getData().items;

        message += "\n\n<b>Балон: " + txtBalon.getValue() + "</b>";

        message += "\n\n<b><u>Нужно:</u></b>";
        for (let i = 0; i < recs.length; i++) {
            if (recs[i].data["is_check"])
                message += "\n" + recs[i].data["name"];
        }

        message += txtAdditional.getValue()? "\n" + txtAdditional.getValue() : "" ;

        me.getFinance(message);
    },

    //Формирования финансовых показателей
    getFinance: function (message) {

        const me = this;

        const date_shift = me.getView().lookupReference("dtfld_dateshift").getValue();
        const money_all = me.getView().lookupReference("txt_all").getValue();
        const money_sber = me.getView().lookupReference("txt_sber").getValue();
        const money_tochka = me.getView().lookupReference("txt_tochka").getValue();
        const money_transfer = me.getView().lookupReference("txt_transfer").getValue();
        const money_cash = me.getView().lookupReference("txt_cash").getValue();
        const cash = money_cash + parseInt(localStorage.getItem("Cash"));

        Ext.Msg.prompt(
            'Закрытие смены',
            'Сейчас в кассе',
            function (r, value_cash) {

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Mobile.php',
                    params: {
                        'query': 'closeShift',
                        'date_shift': Ext.Date.format(date_shift, 'Ymdhis'),
                        'money_all': money_all,
                        'money_acquiring': money_sber + money_tochka,
                        'money_transfer': money_transfer,
                        'money_cash': value_cash,
                        'money_shift_cash': money_cash,
                        'id_user': localStorage.getItem("UserID")
                    },
                    success: function (result) {

                        //let message = "<b>Смена от " + Ext.Date.format(date_shift, 'd.m.Y') + "</b>\n\n";
                        message += "\n\n<b>Выручка: " + money_all + "руб</b>\n";
                        message += "Оплата по картам: " + (money_sber + money_tochka) + "руб\n";
                        message += money_transfer? "Оплата переводами: " + money_transfer + "руб\n" : "";
                        message += "<b>Сейчас в кассе: " + value_cash + "руб</b>\n";

                        me.sendTelegram(message);

                        Ext.Msg.alert("Закрытие смены", "Смена закрыта");
                        me.logout();

                    },
                    failure: function (result) {
                        Ext.Msg.alert("Внимание", result.responseText);
                    }
                });
            },
            null,
            false,
            cash
        );
    },

    //Выход из окна
    logout: function () {

        Ext.Viewport.removeAt(0);

        Ext.Viewport.add({
            xtype: 'login'
        });
    },

    //Обработчик изменения цен
    onMoneyChange: function (field, newValue, oldValue) {

        const me = this;

        const money_all = me.getView().lookupReference("txt_all").getValue();
        const money_sber = me.getView().lookupReference("txt_sber").getValue();
        const money_tochka = me.getView().lookupReference("txt_tochka").getValue();
        const money_transfer = me.getView().lookupReference("txt_transfer").getValue();
        const txt_cash = me.getView().lookupReference("txt_cash");

        let cash = parseInt(money_all) - parseInt(money_sber) - parseInt(money_tochka) - parseInt(money_transfer);
        txt_cash.setValue(cash);
    },


    sendTelegram: function (message) {

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': 'sendMessageTG',
                'message': message,
                'photo': null,
                'document': null
            },
            success: function (result) {
                console.log('send message');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    }

});

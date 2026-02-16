Ext.define('beetlecraft.view.main.Store.AdmissionController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.admission',

    /* Активация вкладки */
    onActivate: function () {
        const me = this;

        const gridAdmission = me.getView().lookupReference("grid_admission");
        if (gridAdmission.getStore())
            gridAdmission.getStore().reload();
    },

    /* Загрузка информации о Закупке */
    onLoadAdmissionInfo: function (dv, location) {

        const me = this;
        const ppData = location.record.data;

        const gridAdmissionInfo = me.getView().lookupReference("grid_admission_info");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': 'getAdmissionInfo',
                'order': ppData["order"]
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);
                gridAdmissionInfo.getStore().loadData(ddData);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    /* Обновление закупок */
    onReloadAdmission: function () {
        const gridAdmission = this.getView().lookupReference("grid_admission");
        if (gridAdmission.getStore())
            gridAdmission.getStore().reload();
    },

    /* Отменить  поставку на склад */
    onCancelStorage: function () {

        const me = this;

        const gridAdmission = me.getView().lookupReference("grid_admission");
        const gridAdmissionInfo = me.getView().lookupReference("grid_admission_info");
        let rec = gridAdmission.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите отменить Завоз?', function (buttonId) {

            if (buttonId != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Admission.php',
                params: {
                    'query': 'cancelAdmission',
                    'order': rec.data["order"]
                },
                success: function (result) {
                    gridAdmission.getStore().reload();
                    gridAdmissionInfo.getStore().loadData([]);
                    Ext.data.StoreManager.lookup("storePurchases").reload();

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Admission.php',
                        params: {
                            'query': 'sendMessageTG',
                            'message': "❌ Завоз от " + rec.data["supplier"] + " возвращен в Закупки",
                            'photo': null,
                            'document': null
                        },
                        success: function (result) {
                            console.log(result);
                        },
                        failure: function (result) {
                            Ext.Msg.alert(result.responseText);
                        }
                    })
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })

        })
    },

    /* Сохранение закупки на склад */
    onAddStorage: function () {
        const me = this;
        const gridAdmission = me.getView().lookupReference("grid_admission");
        const gridAdmissionInfo = me.getView().lookupReference("grid_admission_info");

        let rec = gridAdmission.getSelection();

        if (!rec)
            return;

        const dataAdmissionInfo = Ext.data.StoreManager.lookup("storeAdmissionInfo").getData().items;
        let ids = [];
        Ext.Array.each(dataAdmissionInfo, function(adm, index, countriesItSelf) {

            if (adm.data["tare_name"] == "Бутылка")
                ids.push(adm.data["ID"]);
        });

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите добавить завоз на Склад?', function (buttonId) {

            if (buttonId != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Admission.php',
                params: {
                    'query': 'applyAdmission',
                    'order': rec.data["order"]
                },
                success: function (result) {
                    gridAdmission.getStore().reload();
                    gridAdmissionInfo.getStore().loadData([]);
                    Ext.data.StoreManager.lookup("storeStorageDraft").reload();
                    Ext.data.StoreManager.lookup("storeStorageBottle").reload();
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Admission.php',
                        params: {
                            'query': 'sendMessageTG',
                            'message': "✅ Завоз от " + rec.data["supplier"] + " добавлен на Склад",
                            'photo': null,
                            'document': null
                        },
                        success: function (result) {

                            me.onCreatePriceTags(null, ids);
                        },
                        failure: function (result) {
                            Ext.Msg.alert(result.responseText);
                        }
                    })

                    me.onGenText();
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        })
    },

    /* Создание ценников */
    onCreatePriceTags: function (ev, ids) {

        let bbData = [];

        if (ids.length > 0)
            bbData = ids;
        else {

            let dataAdmission = Ext.data.StoreManager.lookup("storeAdmissionInfo").getData();
            if (dataAdmission.items)
                dataAdmission = dataAdmission.items;
            else
                return;

            for (let i = 0; i < dataAdmission.length; i++) {
                if (dataAdmission[i].data["tare_name"] == "Бутылка")
                    bbData.push(dataAdmission[i].data["ID"]);
            }
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Storage.php',
            params: {
                'query': 'createPriceTags',
                'ids': bbData.join(",")
            },
            success: function (result) {

                console.log(result);

                window.open('https://beetlecraft.ru/lk/cen_beetle.pdf', '_blank');
            },
            failure: function (result) {
                console.log(result);
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    /* Формирование текста для соцсетей */
    onGenText: function () {

        const gridAdmission = this.getView().lookupReference("grid_admission");
        let rec = gridAdmission.getSelection();

        if (!rec)
            return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': 'getForGenTextByOrder',
                'order': rec.data["order"]
            },
            success: function (result) {

                const ddData = JSON.parse(result.responseText);
                let ddObj = {};

                if (ddData.length == 0)
                    return;

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

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Admission.php',
                    params: {
                        'query': 'sendMessageTG',
                        'message': text,
                        'photo': null,
                        'document': null
                    },
                    success: function (result) {
                        console.log(result);
                    },
                    failure: function (result) {
                        Ext.Msg.alert(result.responseText);
                    }
                })

            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    }

});
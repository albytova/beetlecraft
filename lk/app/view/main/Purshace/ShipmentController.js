Ext.define('beetlecraft.view.main.Purshace.ShipmentController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.shipment',

    /* Активация вкладки */
    onActivate: function () {
        const me = this;

        const gridPurchases = me.getView().lookupReference("grid_purchases");
        if (gridPurchases.getStore())
            gridPurchases.getStore().reload();
    },

    /* Загрузка информации о Закупке */
    onLoadPurchaseInfo: function (dv, location) {

        const me = this;
        const dataPP = location.record.data;

        const panelPurchaseInfo = me.getView().lookupReference("purchase_info");
        const gridPurchase = panelPurchaseInfo.lookupReference("grid_purshace");
        const dataTare = panelPurchaseInfo.getController().getPreformTareColumns();

        if (gridPurchase.getColumns().length == 5) {
            panelPurchaseInfo.getController().generateColumnsTare(dataTare, gridPurchase);
        }
        panelPurchaseInfo.getController().setEditData(dataPP, dataTare);
    },

    /* Сохранение закупки на склад */
    onAddStorage: function () {
        const me = this;
        const gridPurchases = me.getView().lookupReference("grid_purchases");
        const panelPurchaseInfo = me.getView().lookupReference("purchase_info");
        const gridPurchase = panelPurchaseInfo.lookupReference("grid_purshace");
        const supplier = panelPurchaseInfo.lookupReference("txt_supplier").getValue();

        let rec = gridPurchases.getSelection();

        if (!rec)
            return;

        const data = gridPurchase.getStore().getData().items;
        let ids = [];
        Ext.Array.each(data, function(adm, index, countriesItSelf) {

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
                    gridPurchases.getStore().reload();
                    gridPurchase.getStore().loadData([]);
                    Ext.data.StoreManager.lookup("storeStorageDraft").reload();
                    Ext.data.StoreManager.lookup("storeStorageBottle").reload();
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Admission.php',
                        params: {
                            'query': 'sendMessageTG',
                            'message': "✅ Завоз от " + supplier + " добавлен на Склад",
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

    /* Формирование текста для соцсетей */
    onGenText: function () {

        const gridPurchases = this.getView().lookupReference("grid_purchases");
        let rec = gridPurchases.getSelection();

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
    },

    /* Обновление закупок */
    onReloadPurchases: function () {
        const gridPurchases = this.getView().lookupReference("grid_purchases");
        if (gridPurchases.getStore())
            gridPurchases.getStore().reload();
    },

    /* Удаление закупки */
    onDeleteShipment: function () {
        const gridPurchases = this.getView().lookupReference("grid_purchases");
        let rec = gridPurchases.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите удалить Закупку?', function (buttonId) {

            if (buttonId != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Purchases.php',
                params: {
                    'query': 'deletePurchase',
                    'order': rec.data["order"]
                },
                success: function (result) {
                    if (gridPurchases.getStore())
                        gridPurchases.getStore().reload();
                },
                failure: function (result) {
                    console.log("ERROR: " + result.responseText);
                }
            })
        }, this);
    },

    /* Создание ценников */
    onCreatePriceTags: function (ev, ids) {

        const me = this;
        let bbData = [];

        if (ids.length > 0)
            bbData = ids;
        else {

            const panelPurchaseInfo = me.getView().lookupReference("purchase_info");
            const gridPurchase = panelPurchaseInfo.lookupReference("grid_purshace");

            let data = gridPurchase.getStore().getData();
            if (data.items)
                data = data.items;
            else
                return;

            for (let i = 0; i < data.length; i++) {
                if (data[i].data["tare_name"] == "Бутылка")
                    bbData.push(data[i].data["ID"]);
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

            },
            failure: function (result) {
                console.log(result);
                Ext.Msg.alert(result.responseText);
            }
        })
    }
});
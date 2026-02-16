Ext.define('beetlecraft.view.main.Purshace.PurchasesController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.purchases',

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
        const gridPurchaseInfo = panelPurchaseInfo.lookupReference("grid_purshace_result");
        const dataTare = panelPurchaseInfo.getController().getPreformTareColumns(dataPP["id_shop"]);

        if (gridPurchaseInfo.getColumns().length == 3) {
            panelPurchaseInfo.getController().generateColumnsTare(dataTare, gridPurchaseInfo);
        }
        panelPurchaseInfo.getController().setEditData(dataPP, dataTare);
    },

    /* Обновление закупок */
    onReloadPurchases: function () {
        const gridPurchases = this.getView().lookupReference("grid_purchases");
        if (gridPurchases.getStore())
            gridPurchases.getStore().reload();
    },

    /* Удаление закупки */
    onDeletePurchases: function () {
        const gridPurchases = this.getView().lookupReference("grid_purchases");
        let rec = gridPurchases.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Внимание', 'Вы действительно хотите удалить Закупку?', function (buttonId) {

            if (buttonId != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/NewPurshace.php',
                params: {
                    'query': 'deletePurshace',
                    'id_shop': rec.data["id_shop"],
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

    /* Утверждение закупки */
    onApprove: function () {
        const me = this;
        const gridPurchases = me.getView().lookupReference("grid_purchases");
        let rec = gridPurchases.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Внимание', 'Вы точно хотите утвердить Закупку?', function (buttonId) {

            if (buttonId != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Purchases.php',
                params: {
                    'query': 'approvePurchase',
                    'id_shop': rec.data["id_shop"],
                    'order': rec.data["order"]
                },
                success: function (result) {
                    if (gridPurchases.getStore())
                        gridPurchases.getStore().reload();

                    Ext.data.StoreManager.lookup("storeAdmission").reload();

                },
                failure: function (result) {
                    console.log("ERROR: " + result.responseText);
                }
            })
        }, this);
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

    onOpen: function () {

        const me = this;
        const panelPurchaseInfo = me.getView().lookupReference("purchase_info");
        const gridPurchaseInfo = panelPurchaseInfo.lookupReference("grid_purshace_result");
        const dataCalculateCost = gridPurchaseInfo.getStore().getData().items;
        const columns = gridPurchaseInfo.getColumns();
        let genColumns = [];

        for (let i = 0; i < columns.length; i++) {
            if (columns[i].initialConfig.generated) {
                columns[i].initialConfig["editable"] = true;
                columns[i].initialConfig["editor"] = {
                    xtype: 'textfield',
                    readOnly: true
                }
                genColumns.push(columns[i].initialConfig);
            }
        }

        Ext.create({
            xtype: 'winpurchases',
            title: 'Закупка',
            initData: dataCalculateCost,
            genColumns: genColumns,
            listeners: {
                destroy: function () {
                   // me.onReload();
                }
            }
        }).show()
    }
});
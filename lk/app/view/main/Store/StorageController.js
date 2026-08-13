Ext.define('beetlecraft.view.main.Store.StorageController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.storage',

    /* Постновка кега на кран */
    onSetTap: function () {

        const me = this;
        const gridStorageDraft = this.getView().lookupReference("grid_storage_draft");
        let rec = gridStorageDraft.getSelection();

        if (!rec)
            return;

        Ext.Msg.prompt('Постановка на кран', 'Укажите номер крана', function(r, numtap) {

            if (!numtap) {
                Ext.Msg.alert('Постановка на кран', "Номер крана не указан");
                return;
            }

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Storage.php',
                params: {
                    'query': 'setTap',
                    'id_shop': rec.data["id_shop"],
                    'id_beer': rec.data["id_beer"],
                    'numtap': numtap,
                    'id_purchase': rec.data["p_id"]
                },
                success: function (result) {
                    gridStorageDraft.getStore().reload();


                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Menu.php',
                        params: {
                            'query': 'getUntappd',
                            'BID': rec.data["beer_uid"]
                        },
                        success: function (result) {
                            const ddData = JSON.parse(result.responseText);
                            const beer_link = "https://untappd.com/b/"+ddData["beer_slug"]+"/"+rec.data["beer_uid"];

                            let message = "<b><u>На кран поставили " + ddData["name"] + " от " + ddData["brewery"] + "</u></b>\n\n";
                            message += "<i>" + rec.data["beer_dist"] + "\n";
                            message += "ABV " + ddData["abv"] + "%" + (ddData["ibu"]? " IBU " + ddData["ibu"] : "") + " <a href='"+beer_link+"'>Untappd " + ddData["rating"] +"</a></i>\n\n";
                            message += ddData["description"] + "\n\n";

                            me.sendTelegram(message, ddData["beer_label_hd"], true);
                            me.sendTelegram("На кран № " + numtap + " поставили " + ddData["name"] + " от " + ddData["brewery"]);
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
        });
    },

    /* Удалить кег со склада */
    onRemoveDraft: function () {

        const me = this;
        const gridStorageDraft = this.getView().lookupReference("grid_storage_draft");
        let rec = gridStorageDraft.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Удаление кега', 'Вы действительно хотите удалить кег: <b>'+rec.data["beer_name"]+'</b>?', function(ans) {

            if (ans != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Menu.php',
                params: {
                    'query': 'removeTap',
                    'id_purchase': rec.data["p_id"]
                },
                success: function (result) {

                    me.onReloadDraft();
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        })
    },

    /* Выделение строки */
    onSelectGrid: function (grid, record) {

        const me = this;
        const btnAvailDraft = me.getView().lookupReference("btn_avail_draft");

        if (record[0].data["status"] != 5) {

            btnAvailDraft.setText("Скрыть");
            btnAvailDraft.setIconCls("fas fa-eye-slash");
        }
        else {

            btnAvailDraft.setText("Отобразить");
            btnAvailDraft.setIconCls("fas fa-eye");
        }
    },

    /* Отображение содержимого колонки */
    onRendererColumn: function(value, record, dataIndex, cell) {

        if (record.data["status"] == 5)
            cell.setStyle('color: lightgrey;')
        else
            cell.setStyle('color: black;');
        return value;
    },

    /* Скрыть кеги */
    onHideDraft: function () {

        const me = this;
        const gridStorageDraft = this.getView().lookupReference("grid_storage_draft");
        let rec = gridStorageDraft.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Скрытие кега', 'Вы действительно хотите '+
            (rec.data["status"] == 5? 'отобразить' : 'скрыть')
            +' кег: <b>'+rec.data["beer_name"]+'</b>?', function(ans) {

            if (ans != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Storage.php',
                params: {
                    'query': rec.data["status"] == 5? 'visibleDraft' : 'hideDraft',
                    'id_purchase': rec.data["p_id"]
                },
                success: function (result) {

                    me.onReloadDraft();
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        })
    },

    /* Перемещение бутылок в торговый зал */
    onMoveToShop: function () {

        const gridStorageBottle = this.getView().lookupReference("grid_storage_bottle");
        const dataStorageBottle = gridStorageBottle.getStore().getData().items;
        const me = this;

        let rrData = [];
        for (let i = 0; i < dataStorageBottle.length; i++) {
            if (dataStorageBottle[i].data["is_check"]) {
                let bb = dataStorageBottle[i].data;

                rrData.push (bb["beer_name"] + " [" + bb["brewery_name"] + "]");

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/Storage.php',
                    params: {
                        'query': 'moveToShop',
                        'id_purchase': bb["p_id"],
                        'id_beer': bb["id_beer"],
                        'id_shop': bb["id_shop"],
                        'count': bb["count"]
                    },
                    success: function (result) {

                        gridStorageBottle.getStore().reload();
                    },
                    failure: function (result) {
                        Ext.Msg.alert(result.responseText);
                    }
                })
            }
        }

        me.sendTelegram("✅ В торговый зал добавлены следующие позиции:\n\n" + rrData.join("\n"));
    },

    /* Удаление бутылок со склада */
    onRemoveBottle: function () {

        const gridStorageBottle = this.getView().lookupReference("grid_storage_bottle");
        const dataStorageBottle = gridStorageBottle.getStore().getData().items;

        Ext.Msg.confirm('Удаление бутылок', 'Вы действительно хотите удалить бутылки со склада?', function(ans) {

            if (ans != 'yes')
                return;


            let rrData = [];
            for (let i = 0; i < dataStorageBottle.length; i++) {
                if (dataStorageBottle[i].data["is_check"]) {
                    let bottle = dataStorageBottle[i].data;

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Storage.php',
                        params: {
                            'query': 'removeBottle',
                            'id_purchase': bottle["p_id"]
                        },
                        success: function (result) {
                            gridStorageBottle.getStore().reload();
                        },
                        failure: function (result) {
                            Ext.Msg.alert(result.responseText);
                        }
                    })
                }
            }
        });

    },

    onReloadDraft: function () {
        this.getView().lookupReference("grid_storage_draft").getStore().reload();
    },

    onReloadBottle: function () {
        this.getView().lookupReference("grid_storage_bottle").getStore().reload();
    },

    /* Создание ценников */
    onCreatePriceTags: function () {

        const gridStorageBottle = this.getView().lookupReference("grid_storage_bottle");
        const dataStorageBottle = gridStorageBottle.getStore().getData().items;

        let bbData = [];

        for (let i = 0; i < dataStorageBottle.length; i++) {
            if (dataStorageBottle[i].data["is_check"])
                bbData.push(dataStorageBottle[i].data["p_id"]);
        }

        if (bbData.length == 0)
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

                //window.open('https://beetlecraft.ru/lk/cen_beetle.pdf', '_blank');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    /* Формирование текста для соцсетей */
    onGenText: function () {

        const gridStorageBottle = this.getView().lookupReference("grid_storage_bottle");
        const dataStorageBottle = gridStorageBottle.getStore().getData().items;
        const me = this;

        let bbData = [];

        for (let i = 0; i < dataStorageBottle.length; i++) {
            if (dataStorageBottle[i].data["is_check"])
                bbData.push(dataStorageBottle[i].data["p_id"]);
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
        })
    }
});
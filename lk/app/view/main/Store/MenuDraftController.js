Ext.define('beetlecraft.view.main.Store.MenuDraftController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.menudraft',

    /* Активация вкладки */
    onActivate: function () {
        const me = this;

        setTimeout(me.loadDraft, 2000, me, 1);
    },

    /* Загрузка таблицы с кегами */
    loadDraft : function (mes, fromActivate) {

        const is_generate = fromActivate == 1? 1 : 0;

        const me = is_generate? mes : this;

        const gridMenuDraft = me.lookupReference("grid_menu_draft");

        const tareData = me.preformTareColumns();
        const columnsData = me.generateColumnsTare(tareData, gridMenuDraft, is_generate);

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Menu.php',
            params: {
                'query': 'getMenuDraft'
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);

                let draftObj = {}, draftData = [];
                for (let i = 0; i < ddData.length; i++) {

                    const id_purchase = ddData[i]["p_id"];

                    if (!draftObj[ id_purchase ]) {
                        draftObj[id_purchase] = {
                            "p_id": ddData[i]["p_id"],
                            "numtap": parseInt(ddData[i]["numtap"]),
                            "id_shop": ddData[i]["id_shop"],
                            "order": ddData[i]["order"],
                            "id_beer": ddData[i]["id_beer"],
                            "beer_name": ddData[i]["beer_name"],
                            "beer_uid": ddData[i]["beer_uid"],
                            "beer_dist": ddData[i]["beer_dist"],
                            "beer_abv": ddData[i]["beer_abv"],
                            "beer_ibu": ddData[i]["beer_ibu"],
                            "beer_id": ddData[i]["beer_id"],
                            "cost_id": ddData[i]["cost_id"],
                            "brewery_name": ddData[i]["brewery_name"]
                        }
                    }

                    const id_tare_unit = ddData[i]["id_tare_unit"];
                    draftObj[ id_purchase ][ columnsData[id_tare_unit] ] = ddData[i]["cost"];

                    if (!draftObj[ id_purchase ][ "ids_cost" ])
                        draftObj[ id_purchase ][ "ids_cost" ] = {};

                    draftObj[ id_purchase ][ "ids_cost" ] [columnsData[id_tare_unit]] = ddData[i]["cost_id"];

                }

                Ext.Object.eachValue(draftObj, function (dd) {
                    draftData.push(dd);
                })

                if (gridMenuDraft.getStore()) {
                    gridMenuDraft.getStore().loadData(draftData);

                    gridMenuDraft.getStore().sort('numtap', 'ASC');
                }

            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    /* Формирование объектов с тарой, привязанной к магазину */
    preformTareColumns: function () {

        const storeTare = Ext.data.StoreManager.lookup("storeTare");
        const tareData = storeTare.getData().items;

        let tare = {};
        const shopID = localStorage.getItem("ShopID");
        for (let i = 0; i < tareData.length; i++) {
            if (tareData[i].data["id_shop"] == shopID)
                tare [tareData[i].data["name"]] = {
                    id: tareData[i].data["ID"],
                    name: tareData[i].data["name"],
                    formula: tareData[i].data["formula"],
                    count_unit: parseInt(tareData[i].data["count_unit"]),
                    type: parseInt(tareData[i].data["type"])
                }
        }

        return tare;
    },

    /* Формирование колонок с бокалами/бутылками */
    generateColumnsTare: function (tareData, grid, is_generate) {
        const me = this;
        let columnsData = {};

        grid.setColumns( [
            {
                text: 'Кран',
                dataIndex: 'numtap'
            },
            {
                text: 'Пивоварня',
                dataIndex: 'brewery_name',
                flex: 1
            },
            {
                text: 'Название',
                dataIndex: 'beer_name',
                flex: 1
            },
            {
                text: 'Описание',
                dataIndex: 'beer_dist',
                flex: 1
            },
            {
                text: 'Крепость',
                dataIndex: 'beer_abv'
            },
            {
                text: 'Горечь',
                dataIndex: 'beer_ibu'
            }
        ] );

        Ext.Object.eachValue(tareData, function (value) {

            if (value.type == 2) {
                let trns = value.name.toLowerCase().replace(" ", "_");
                trns = me.toTranslit(trns);

                if (is_generate) {

                    grid.addColumn({
                        text: value.name,
                        dataIndex: 'unit_' + trns,
                        flex: 1,
                        editable: true,
                        editor: {
                            xtype: 'textfield'
                        }
                    })
                }
                columnsData [value.id] = 'unit_' + trns;
            }
        })

        return columnsData;
    },

    onReloadDraft: function () {

        this.loadDraft(this, 1);
    },

    onSaveCost: function(grid, location) {

        const me = this;
        const item = location.record.data;
        const cost = item[ location.cell.dataIndex ];

        if (!cost) {
            Ext.Msg.alert("Внимание", "Цена не может быть пустой!");
            this.loadDraft(this, 1);
            return;
        }

        const storeTare = Ext.data.StoreManager.lookup("storeTare");
        const tareData = storeTare.getData().items;

        let tare = {};
        const shopID = localStorage.getItem("ShopID");
        for (let i = 0; i < tareData.length; i++) {
            if (tareData[i].data["id_shop"] == shopID) {

                let trns = tareData[i].data["name"];
                trns = trns.toLowerCase().replace(" ", "_");
                trns = 'unit_' + me.toTranslit(trns);
                tare [trns] = tareData[i].data["ID"];
            }
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Menu.php',
            params: {
                'query': 'saveDraftCost',
                'cost_id': item.ids_cost [location.cell.dataIndex]? item.ids_cost [location.cell.dataIndex] : -1,
                'id_tare': tare[location.cell.dataIndex],
                'cost': cost,
                'p_id': item.p_id
            },
            success: function (result) {
                console.log('update cost');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })

        location.record.commit();
    },

    toTranslit: function rus_to_latin(str) {

        let ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh',
            'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya',
            'ъ': 'ie', 'ь': '', 'й': 'i'
        }, n_str = [];

        for (let i = 0; i < str.length; ++i) {
            n_str.push(
                ru[str[i]]
                || ru[str[i].toLowerCase()] == undefined && str[i]
                || ru[str[i].toLowerCase()].replace(/^(.)/, function (match) {
                    return match.toUpperCase()
                })
            );
        }

        return n_str.join('');
    },

    /* Получение информации из Untappd */
    onUntappd: function () {

        const me = this;
        const gridMenuDraft = me.getView().lookupReference("grid_menu_draft");
        let rec = gridMenuDraft.getSelection();

        if (!rec)
            return;

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

                let message = "<b><u>" + ddData["name"] + " от " + ddData["brewery"] + "</u></b>\n\n";
                message += "<i>" + rec.data["beer_dist"] + "\n";
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

    /* Удаление кеги */
    onRemoveTap: function () {

        const me = this;
        const gridMenuDraft = me.getView().lookupReference("grid_menu_draft");
        let rec = gridMenuDraft.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Удаление кега', 'Вы действительно хотите убрать с крана: <b>'+rec.data["beer_name"]+'</b>?', function(ans) {

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
                    me.loadDraft();

                    const message = rec.data["beer_name"] + " снято с крана";
                    me.sendTelegram(message);
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        });
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
    },

    onBackStorage: function () {

        const me = this;
        const gridMenuDraft = me.getView().lookupReference("grid_menu_draft");
        let rec = gridMenuDraft.getSelection();

        if (!rec)
            return;

        Ext.Msg.confirm('Возврат кега', 'Вы действительно хотите вернуть кег на склад: <b>'+rec.data["beer_name"]+'</b>?', function(ans) {

            if (ans != 'yes')
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Menu.php',
                params: {
                    'query': 'rewertDraft',
                    'id_purchase': rec.data["p_id"]
                },
                success: function (result) {
                    me.loadDraft();

                    const message = rec.data["beer_name"] + " возвращен на склад";
                    me.sendTelegram(message);
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        });
    }
});
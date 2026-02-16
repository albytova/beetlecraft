Ext.define('beetlecraft.view.main.Purshace.NewPurshaceController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.newpurshace',


    /* Активация вкладки */
    onActivate: function () {
        const me = this;

        const gridPurshaceResult = me.lookupReference("grid_purshace_result");
        const tareData = me.getPreformTareColumns();

        me.getView().INLINE_DATA["tare"] = tareData;

        if (me.getView().INLINE_DATA["is_activate"])
            return;

        me.getView().INLINE_DATA["is_activate"] = true;

        me.generateColumnsTare(tareData, gridPurshaceResult);
    },

    onShow: function () {

        const me = this;

        const foulCopy = me.getView().FoulCopy;

        if (foulCopy) {
            me.lookupReference('txt_supplier').setValue(foulCopy.supplier);
            me.lookupReference('txt_ship').setValue(foulCopy.ship);
        }

            Ext.Ajax.request({
                method: 'GET',
                url: './php/NewPurshace.php',
                params: {
                    "query": 'getBaseBeer'
                },
                success: function (result) {

                    const baseBeer = JSON.parse(result.responseText);

                    me.lookupReference('grid_purshace').setColumns([
                        {
                            text: '',
                            dataIndex: 'counter',
                            width: 20
                        },
                        {
                            text: 'Сорт',
                            dataIndex: 'id_beer',
                            flex: 3,
                            editable: true,
                            editor: {
                                xtype: 'combobox',
                                valueField: 'beer_name',
                                displayField: 'beer_name',
                                queryMode: 'local',
                                autoSelect : true,
                                forceSelection: true,
                                store: baseBeer
                            }
                        },
                        {
                            text: 'Тара',
                            dataIndex: 'id_tare',
                            editable: true,

                            editor: {

                                xtype: 'combobox',
                                store: Ext.data.StoreManager.lookup("storeTare"),
                                displayField: 'name',
                                valueField: 'name',
                                queryMode: 'local',
                                autoSelect : true,
                                forceSelection: true,
                            }

                        },
                        {
                            text: 'Количество',
                            dataIndex: 'count',
                            editable: true,
                            editor: {
                                xtype: 'textfield'
                            }
                        },
                        {
                            text: 'Общая стоимость',
                            dataIndex: 'cost',
                            flex: 1,
                            editable: true,
                            editor: {
                                xtype: 'textfield'
                            }
                        }
                    ]);

                    if (foulCopy) {

                        me.lookupReference('grid_purshace').getStore().loadData(foulCopy.dataBeforePP);
                        me.lookupReference('grid_purshace_result').getStore().loadData([]);
                    }
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
    },

    /* Добавление строки */
    onAddRecord: function () {
        const grid = this.getView().lookupReference("grid_purshace");

        grid.getStore().insert( grid.getStore().getData().items.length, {
            id_beer: null
        });
    },

    /* Удаление строки */
    onDeleteRecord: function () {
        const gridPurshase = this.lookupReference("grid_purshace");
        const gridPurshaseResult = this.lookupReference("grid_purshace_result");

        const selectedRecord = gridPurshase.getSelection();
        const resultData = gridPurshaseResult.getStore().getData().items;

        for (let i = 0; i < resultData.length; i++) {

            if (resultData[i].data["parent_record_id"] == selectedRecord.id) {

                gridPurshaseResult.getStore().remove(resultData[i]);
            }
        }

        gridPurshase.getStore().remove(selectedRecord);
    },

    /* Расчет цен */
    onCalculate: function () {

        const me = this;

        const gridPurshase = me.lookupReference("grid_purshace");
        const gridPurshaseResult = me.lookupReference("grid_purshace_result");
        const purshaseGridData = gridPurshase.getStore().getData().items;

        let purshaseData = [];
        for (let i = 0; i < purshaseGridData.length; i++) {
            if (purshaseGridData[i].data["id_beer"] && purshaseGridData[i].data["id_tare"] && purshaseGridData[i].data["count"] && purshaseGridData[i].data["cost"])
                purshaseData.push(purshaseGridData[i].data);
        }

        let tare = me.getPreformTareColumns();

        const txt_ship = me.lookupReference("txt_ship");
        const cost_ship = txt_ship.getValue();

        let count_units = 0;

        for (let i = 0; i < purshaseData.length; i++) {

            let tare_count_unit = tare[purshaseData[i]["id_tare"]] ["count_unit"];

            if (tare_count_unit > 0)
                count_units += tare_count_unit * parseInt(purshaseData[i]["count"]);
            else
                count_units += parseInt(purshaseData[i]["count"]);
        }

        let markup_ship = 0;
        if (parseInt(cost_ship) > 0) {

            markup_ship = (parseInt(cost_ship) / count_units).toFixed(1);
        }

        for (let i = 0; i < purshaseData.length; i++) {

            let pursh = purshaseData[i];

            let tare_count_unit = tare[pursh["id_tare"]] ["count_unit"];
            let count_unit = 0;

            if (tare_count_unit > 0)
                count_unit = tare_count_unit * parseInt(pursh["count"]);
            else
                count_unit = parseInt(pursh["count"]);

            let ff = parseInt(pursh["cost"]) / count_unit + parseInt(markup_ship);
            let formula = tare[pursh["id_tare"]] ["formula"];
            formula = formula.replace("x", ff);
            ff = math.evaluate(formula);
            ff = me.myRound(ff);

            pursh["cost_liter"] = ff.toFixed(0);
            pursh["shop_id"] = localStorage.getItem("ShopID");

            purshaseData[i] = pursh;
        }

        /* Расчет порции */
        for (let i = 0; i < purshaseData.length; i++) {

            let pursh = purshaseData[i];
            const type_tare = tare [pursh["id_tare"]]["type"];

            if (type_tare == 1) {
                pursh["bottle_cost"] = parseFloat(pursh["cost_liter"]).toFixed(0);
                pursh["tare_cost"] = [{
                    tare: tare [pursh["id_tare"]]["id"],
                    cost: pursh["bottle_cost"]
                }];
            } else if (type_tare == 0) {

                const units = me.performDrafttoUnits(pursh, tare);
                Ext.Object.eachValue(units.columns, function (unit) {
                    const uu = unit;
                    pursh[uu["column"]] = uu["cost"];
                })
                pursh["tare_cost"] = units.tare_cost;
            }

            pursh["type_tare"] = type_tare;
            pursh["parent_record_id"] = pursh["id"];
            purshaseData[i] = pursh;
        }

        gridPurshaseResult.getStore().loadData(purshaseData);

    },

    myRound: function  (num) {
        num = Math.ceil(num);
        return Math.round(num/5)*5;
    },

    /* Разбитие кега на порции */
    performDrafttoUnits: function (data, tare) {

        let rez = [], tt = [];
        const me = this;
        let cost_liter = data["cost_liter"];

        Ext.Object.eachValue(tare, function (value) {
            if (value.type == 2) {

                //Определяем название колонки
                let trns = value.name.toLowerCase().replace(" ", "_");
                trns = me.toTranslit(trns);

                //Определяем цену порции
                let formula = value.formula;
                formula = formula.replace("y", cost_liter);
                let cost_unit = math.evaluate(formula);
                cost_unit = me.myRound(cost_unit);

                rez.push({
                    column: "unit_" + trns,
                    cost: cost_unit.toFixed(0)
                })

                tt.push({
                    tare: value.id,
                    cost: cost_unit.toFixed(0),
                    column: "unit_" + trns
                })
            }
        })

        return {
            columns: rez,
            tare_cost: tt
        };
    },


    /* Формирование объектов с тарой, привязанной к магазину */
    getPreformTareColumns: function () {

        const storeTare = Ext.data.StoreManager.lookup("storeTare");
        const tareData = storeTare.getData().items;

        let tare = {};
        for (let i = 0; i < tareData.length; i++) {

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
    //
    // /* Получение объектов с тарой, привязанной к магазину */
    // getTareInfo: function () {
    //     return this.getView().INLINE_DATA["tare"];
    // },

    /* Формирование колонок с бокалами/бутылками */
    generateColumnsTare: function (tareData, grid) {
        const me = this;

        Ext.Object.eachValue(tareData, function (value) {
            if (value.type == 1) {
                grid.addColumn({

                    text: 'Цена Бутылки',
                    dataIndex: 'bottle_cost',
                    flex: 1,
                    editable: true,
                    generated: true,
                    editor: {
                        xtype: 'textfield'
                    }
                });

            } else if (value.type == 2) {
                let trns = value.name.toLowerCase().replace(" ", "_");
                trns = me.toTranslit(trns);
                grid.addColumn({

                    text: value.name,
                    dataIndex: 'unit_' + trns,
                    flex: 1,
                    editable: true,
                    generated: true,
                    editor: {
                        xtype: 'textfield'
                    }
                })
            }
        });
    },


    /* Сохранение черновика */
    onSaveTmp: function () {

        const me = this;
        const gridPurshace = me.lookupReference("grid_purshace");

        me.getView().FoulCopy = {

            ship : me.lookupReference("txt_ship").getValue(),
            supplier : me.lookupReference('txt_supplier').getValue(),
            dataBeforePP : gridPurshace.getStore().getData().items
        };
    },

    /* Сохранение закупки в базу */
    onSavePurshace: function () {

        const me = this;

        const gridPurshaceResult = me.lookupReference("grid_purshace_result");
        const gridPurshace = me.lookupReference("grid_purshace");
        const txt_ship = me.lookupReference("txt_ship");

        const dataResult = gridPurshaceResult.getStore().getData().items;
        const dataBeforePP = gridPurshace.getStore().getData().items;
        const dataTare = me.getView().INLINE_DATA["tare"];
        const dataBB = Ext.data.StoreManager.lookup("storeBaseBeer").getData().items;

        let supplier_name = me.lookupReference('txt_supplier').getValue();
        if (!supplier_name) {
            Ext.Msg.alert("Внимание", "Укажите поставщика");
            return;
        }
        let supplier = supplier_name.toUpperCase().replace(" ", "_");
        supplier = me.toTranslit(supplier);

        if (dataResult.length == 0) {
            Ext.Msg.alert("Внимание", "Расчитайте цены");
            return;
        }

        const countMaxUnit = dataBeforePP.length;

        me.getView().setMasked({
            xtype: 'loadmask',
            message: 'Сохранение'
        });

        // Снятие маски и обнуление формы после сохранения
        setTimeout(function () {
            me.getView().unmask();
            //gridPurshaceResult.getStore().loadData([]);
            me.getView().lookupReference("grid_purshace").getStore().loadData([]);
            me.getView().lookupReference("txt_supplier").setValue("");
            me.getView().lookupReference("txt_ship").setValue("");

            if (me.getView().isEditForm) {
                Ext.Msg.alert("Закупки", "Закупка успешно отредактирована!");
            } else
                Ext.Msg.alert("Закупки", "Закупка успешно создана!");
        }, countMaxUnit * 1000);

        // Удаление старых записей
        if (me.getView().INLINE_DATA.order) {

            Ext.Ajax.request({
                method: 'GET',
                url: './php/NewPurshace.php',
                params: {
                    "query": "deletePurshace",
                    'order': me.getView().INLINE_DATA.order
                },
                success: function (result) {
                    runSaveCost (dataResult);
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        }
        else
            runSaveCost (dataResult);

        // Запуск начала сохранения
        function runSaveCost (dataResult) {

            for (let i = 0; i < dataBeforePP.length; i++) {

                const bb = dataBeforePP[i].data;

                if (!bb || !bb["id_beer"])
                    continue;

                let tareBeerData = dataTare[bb["id_tare"]];

                if (!tareBeerData)
                    return;

                if (tareBeerData["type"] == 0 || tareBeerData["type"] == 1) {

                    let order = bb["order"];

                    const params = {
                        'query': 'savePurshace',
                        'order': supplier + Ext.Date.format(new Date, 'Ymdhis'),
                        'id_beer': me.getBeerId(dataBB, bb["id_beer"]),
                        'id_tare': tareBeerData["id"],
                        'count': bb["count"],
                        'cost': bb["cost"],
                        'supplier_name': supplier_name,
                        'date_zakaz': Ext.Date.format(new Date, 'Y-m-d'),
                        "cost_liter": bb["cost_liter"] ? bb["cost_liter"] : "null",
                        "ship": txt_ship.getValue() ? parseFloat(txt_ship.getValue()) : '',
                        "is_edit": me.getView().isEditForm ? order : "-1"
                    }

                    if (me.getView().isEditForm) {
                        if (!order)
                            order = getOrder(dataBeforePP);
                        params["order"] = order;
                        params["is_edit"] = order;
                    }

                    setTimeout(function (id) {

                        Ext.Ajax.request({
                            method: 'GET',
                            url: './php/NewPurshace.php',
                            params: params,
                            success: function (result) {
                                const insert_id = result.responseText;
                                saveCost(insert_id, id, dataResult); //Сохранение цен
                            },
                            failure: function (result) {
                                console.log("ERROR: " + result.responseText);
                            }
                        })
                    }, 5000, bb["id"]);
                }
            }
        }

        // Получение номера завоза
        function getOrder(data) {
            for (let i = 0; i < data.length; i++) {
                const bb = data[i].data;
                if (bb["order"])
                    return bb["order"];
            }
        }

        // Подготовка сохранения цен
        function saveCost(id_parent, id_parent_rec, dataResult) {

            for (let i = 0; i < dataResult.length; i++) {
                const rr = dataResult[i].data;

                if (id_parent_rec == rr["parent_record_id"]) {

                    if (rr["type_tare"] == 1) {
                        saveCostUnit(id_parent, rr["tare_cost"][0]["tare"], rr["bottle_cost"]); // Сохранение цены
                    } else {

                        Ext.Object.eachValue(rr["tare_cost"], function (tc) {
                            saveCostUnit(id_parent, tc.tare, rr [tc.column]); // Сохранение цены
                        })

                    }
                }
            }

        }

        // Сохранение цены
        function saveCostUnit(id_parent, id_tare, cost) {

            setTimeout(function () {
                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/NewPurshace.php',
                    params: {
                        'query': 'savePurshaceCost',
                        'id_parent': parseInt(id_parent),
                        'id_tare': id_tare,
                        'cost': cost,
                        "is_edit": "-1"
                    },
                    success: function (result) {
                        console.log(result.responseText);
                    },
                    failure: function (result) {
                        console.log("ERROR: " + result.responseText);
                    }
                })
            }, 5000)
        }
    },

    /* Получение ID пива по сочетанию Название+Пивоварня */
    getBeerId: function (bbData, id) {
        let id_beer;

        for (let j = 0; j < bbData.length; j++) {
            const bb = bbData[j].data["beer_name"]/* + " [" + bbData[j].data["brewery_name"] + "]"*/;
            if (id == bb) {
                id_beer = bbData[j].data["beer_id"];
                break;
            }
        }

        return id_beer;
    },

    /* Отображение данных закупки */
    setEditData: function (data, tare) {
        const me = this;

        me.getView()["INLINE_DATA"] = {
            tare: tare,
            is_acivate: false,
            is_edit: true,
            order: data["order"]
        };

        //Загрузка в BeforeGrid
        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: {
                'query': 'getPurchaseInfo',
                'id_shop': data["id_shop"],
                'order': data["order"]
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);
                let
                    beforeData = [],
                    ship = 0,
                    ids = {
                        baseIds: [],
                        formIds: {}
                    };

                for (let j = 0; j < ddData.length; j++) {

                    let d = ddData[j];
                    d["counter"] = j+1;
                    d["id_beer"] = d["name"] /*+ " [" + d["brewery_name"] + "]"*/;
                    d["id_tare"] = d["tare_name"];
                    ship = d["ship"];
                    beforeData.push(d);

                    ids.baseIds.push(d["ID"]);
                }

                me.getView().lookupReference("txt_ship").setValue(ship);
                me.getView().lookupReference("grid_purshace").getStore().loadData(beforeData);

                const ffData = me.getView().lookupReference("grid_purshace").getStore().getData().items;
                for (let f = 0; f < ffData.length; f++) {console.log(ffData[f].data);
                    ids.formIds [ffData[f].data["ID"]] = ffData[f].id;
                }

                loadResultData(me, ids); console.log(ids);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })

        function loadResultData(me, ids) {
            Ext.Ajax.request({
                method: 'GET',
                url: './php/NewPurshace.php',
                params: {
                    'query': 'getPurchaseCost',
                    'ids_parent': ids.baseIds.join(",")
                },
                success: function (result) {
                    const resultData = JSON.parse(result.responseText);

                    let rrData = {}, ttData = [];
                    let kk = 1;
                    for (let j = 0; j < resultData.length; j++) {
                        let r = resultData[j];

                        r["id_beer"] = r["beer_name"] /*+ " [" + r["brewery_name"] + "]"*/;
                        r["parent_record_id"] = ids.formIds [r ["id_parent"]];

                        let trns = r["tare_name"].toLowerCase().replace(" ", "_");
                        trns = me.toTranslit(trns);

                        if (r["type_tare"] == 2) {

                            if (!rrData[r["id_beer"]]) {
                                r["counter"] = kk++;
                                rrData[r["id_beer"]] = {
                                    rec: r,
                                    tare_cost: []
                                }
                            };

                            rrData[r["id_beer"]] ["unit_" + trns] = r["cost"];
                            rrData[r["id_beer"]]["tare_cost"].push({
                                tare: r["id_tare"],
                                cost: r["cost"],
                                column: "unit_" + trns
                            })

                        } else if (r["type_tare"] == 1) {
                            r["counter"] = kk++;
                            r["bottle_cost"] = r["cost"];
                            r["tare_cost"] = [{
                                tare: r["id_tare"],
                                cost: r["cost"]
                            }]
                            ttData.push(r);
                        }
                    }

                    for (let key in rrData) {
                        const unit = rrData[key];
                        for (let key1 in unit) {
                            unit.rec [key1] = unit[key1];
                        }

                        ttData.push(unit.rec);
                    }

                    me.getView().lookupReference("grid_purshace_result").getStore().loadData(ttData);
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        }

        me.getView().lookupReference("txt_supplier").setValue(data["supplier"]);

    },

    /* Перевод кирилицы в латиницу */
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
    }
});
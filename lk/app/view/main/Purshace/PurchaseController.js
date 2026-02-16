Ext.define('beetlecraft.view.main.Purshace.PurchaseController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.purchase',


    /* Активация вкладки */
    onActivate: function () {

        const me = this;


    },

    onShow: function () {

        const me = this;


        if (me.lookupReference('grid_purshace').getColumns().length > 5)
            return;

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
                                store: baseBeer,
                                listeners: {
                                    change: function (cmb, newvalue, oldvalue) {

                                        if (oldvalue) {

                                            me.onEditRecord(cmb, {
                                                id_beer: newvalue
                                            })
                                        }
                                        else
                                            me.createPurchase(cmb, newvalue);
                                    }
                                }

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
                                listeners: {
                                    change: function (cmb, value) {

                                        me.onEditRecord(cmb, {
                                            id_tare: value
                                        })
                                    }
                                }
                            }

                        },
                        {
                            text: 'Количество',
                            dataIndex: 'count',
                            editable: true,
                            editor: {
                                xtype: 'textfield',
                                listeners: {
                                    focusleave: function (txt) {
                                        me.onEditRecord(txt, {
                                            count: txt.getValue()
                                        })
                                    }
                                }
                            }
                        },
                        {
                            text: 'Общая стоимость',
                            dataIndex: 'cost',
                            flex: 1,
                            editable: true,
                            editor: {
                                xtype: 'textfield',
                                listeners: {
                                    focusleave: function (txt) {
                                        me.onEditRecord(txt, {
                                            cost: txt.getValue()
                                        })
                                    }
                                }
                            }
                        }
                    ]);

                    me.preformTareColumns();

                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
    },

    /* Добавление строки */
    onAddRecord: function () {

        const grid = this.getView().lookupReference("grid_purshace");
        const txt_supplier = this.getView().lookupReference('txt_supplier');
        const txt_ship = this.getView().lookupReference('txt_ship');
        const len = grid.getStore().getData().items? grid.getStore().getData().items.length : 0;

        if (len == 0 || !txt_supplier.getValue()) {

            Ext.Msg.prompt('Создание закупки', 'Укажите поставщика', function(r, supplier) {
                if (supplier.length > 0) {
                    txt_supplier.setValue(supplier);

                    Ext.Msg.prompt('Создание закупки', 'Укажите стоимость доставки', function(r, ship) {

                            txt_ship.setValue(ship);

                            grid.getStore().insert(len, {
                                counter: len + 1,
                                id_beer: null
                            });

                    })
                }
            })
        }
        else {

            grid.getStore().insert( len, {
                counter: len+1,
                id_beer: null
            });
        }


    },

    /* Закрыть закупку (очистить все поля) */
    onClosePurshace: function () {

        this.getView().lookupReference('txt_ship').setValue("");
        this.getView().lookupReference('txt_supplier').setValue("");
        this.getView().lookupReference("grid_purshace").getStore().loadData([]);
    },

    /* Редактирование строки */
    onEditRecord: function (cell, params) {

        const me = this;
        const record = cell.up("gridrow")._record.data;
        const dataTare = me.getView().INLINE_DATA["tare"];
        const ship = this.getView().lookupReference('txt_ship').getValue();

        params ['query'] = 'editPurshace';
        params ['id_purshace'] = record["id_purshace"];
        params ['ship'] = ship;

        if (params["id_beer"])
            params['id_beer'] = me.getIDBeer(params["id_beer"]);
        else
            params['id_beer'] = me.getIDBeer(record["id_beer"]);

        if (!params["id_beer"])
            return;

        if (params["id_tare"])
            params['id_tare'] = dataTare[ params["id_tare"] ]["id"];
        else
            params['id_tare'] = record["id_tare"]? dataTare[ record["id_tare"] ]["id"] : null;
        params['id_tare'] = params['id_tare']? params['id_tare'] : "null";

        if (!params["count"])
            params['count'] = record["count"];
        params['count'] = params['count']? params['count'] : "null";

        if (!params["cost"])
            params['cost'] = record["cost"];
        params['cost'] = params['cost']? params['cost'] : "null";

        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: params,
            success: function (result) {
                if (result.responseText == 1)
                    console.log("success update");
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
                console.log("ERROR: " + result.responseText);
            }
        })
    },

    /* Редактирование строки с ценами */
    saveCostRecord: function (params) {

        if (params.length == 0)
            return;

        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: {
                query: 'savePurshaceCost',
                params: JSON.stringify(params),
                id_purshace: params[0]["id_purshace"]
            },
            success: function (result) {
                console.log(result.responseText);
                // if (result.responseText == 1)
                //     console.log("success update");
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
                console.log("ERROR: " + result.responseText);
            }
        })
    },

    /* Редактирование строки с ценами */
    onEditCostRecord: function (cell, params) {

        const me = this;
        const record = cell.up("gridrow")._record.data;

        params ['query'] = 'editPurshaceCost';
        params ['id_purshace'] = record["id_purshace"];
        params ['id_tare'] = params.id_tare;
        params ['cost'] = params.cost;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: params,
            success: function (result) {
                if (result.responseText == 1)
                    console.log("success update");
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
                console.log("ERROR: " + result.responseText);
            }
        })
    },

    /* Создание новой записи закупки */
    createPurchase: function (cell, beer_name) {

        const me = this;
        const record = cell.up("gridrow")._record.data;
        const order = me.getOrderNumber();
        let ship = this.getView().lookupReference('txt_ship').getValue();

        const params = {
            'query': 'createPurshace',
            'order': order,
            'id_beer': me.getIDBeer(beer_name),
            'supplier_name': me.getView().lookupReference('txt_supplier').getValue(),
            'date_zakaz': Ext.Date.format(new Date, 'Y-m-d'),
            'ship': ship
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: params,
            success: function (result) {

                const id = parseInt(result.responseText);
                record["id_purshace"] = id;
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
                console.log("ERROR: " + result.responseText);
            }
        })
    },

    /* Формирование номера заказа */
    getOrderNumber: function () {

        if (this.getView()["INLINE_DATA"]["order"])
            return this.getView()["INLINE_DATA"]["order"];

        let supplier = this.getView().lookupReference('txt_supplier').getValue();
        supplier = supplier.toUpperCase().replace(" ", "_");
        supplier = this.toTranslit(supplier) + Ext.Date.format(new Date, 'Ymd');
        return supplier;
    },

    /* Получение ID пива по Названию */
    getIDBeer: function (beer_name) {

        const dataBB = Ext.data.StoreManager.lookup("storeBaseBeer").getData().items;
        let id_beer;

        for (let j = 0; j < dataBB.length; j++) {
            const bb = dataBB[j].data["beer_name"];
            if (beer_name == bb) {
                id_beer = dataBB[j].data["beer_id"];
                break;
            }
        }

        return id_beer;
    },

    /* Удаление строки */
    onDeleteRecord: function () {
        const gridPurshase = this.lookupReference("grid_purshace");

        const selectedRecord = gridPurshase.getSelection();

        Ext.Ajax.request({
            method: 'GET',
            url: './php/NewPurshace.php',
            params: {
                'query': 'deletePurshace',
                'id_purshace': selectedRecord.data["id_purshace"]
            },
            success: function (result) {

                if (result.responseText == 1) {
                    console.log("success delete");
                    gridPurshase.getStore().remove(selectedRecord);
                }
                else {
                    console.log("ERROR: " + result.responseText);
                }
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
                console.log("ERROR: " + result.responseText);
            }
        })
    },

    /* Расчет цен */
    onCalculate: function () {

        const me = this;

        const gridPurshase = me.lookupReference("grid_purshace");
        const purshaseData = gridPurshase.getStore().getData().items;
        const cost_ship = me.lookupReference("txt_ship").getValue();

        let tare = me.getPreformTareColumns();
        let count_units = 0;

        for (let i = 0; i < purshaseData.length; i++) {

            let ppp = purshaseData[i].data;
            let tare_count_unit = tare[ppp["id_tare"]] ["count_unit"];

            if (tare_count_unit > 0)
                count_units += tare_count_unit * parseInt(ppp["count"]);
            else
                count_units += parseInt(ppp["count"]);
        }

        let markup_ship = 0;
        if (parseInt(cost_ship) > 0) {
            markup_ship = (parseInt(cost_ship) / count_units).toFixed(1);
        }

        for (let i = 0; i < purshaseData.length; i++) {

            let pursh = purshaseData[i].data;

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
            let paramsCost = [];

            if (type_tare == 1) {
                pursh["bottle_cost"] = parseFloat(pursh["cost_liter"]).toFixed(0);
                pursh["tare_cost"] = [{
                    tare: tare [pursh["id_tare"]]["id"],
                    cost: pursh["bottle_cost"]
                }];
                paramsCost.push({
                    id_purshace: pursh["id_purshace"],
                    id_tare: tare [pursh["id_tare"]]["id"],
                    cost: pursh["bottle_cost"]
                })
            }
            else if (type_tare == 0) {

                const units = me.performDrafttoUnits(pursh, tare);
                Ext.Object.eachValue(units.columns, function (unit) {
                    const uu = unit;
                    pursh[uu["column"]] = uu["cost"];

                    paramsCost.push({
                        id_purshace: pursh["id_purshace"],
                        id_tare: uu.tare,
                        cost: uu.cost
                    })
                })
                pursh["tare_cost"] = units.tare_cost;
            }

            pursh["type_tare"] = type_tare;
            pursh["parent_record_id"] = pursh["id"];
            purshaseData[i] = pursh;

            me.saveCostRecord(paramsCost);
        }

        gridPurshase.getStore().loadData(purshaseData, true);

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
                    cost: cost_unit.toFixed(0),
                    tare: value.id
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

    /* Формирование объектов с тарой, привязанной к магазину */
    preformTareColumns: function () {
        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Tare.php',
            params : {
                'query': 'getTare',
                'id_shop': localStorage.getItem("ShopID")
            },
            success: function(result) {
                if (result && result.status == 200) {

                    const tareData = JSON.parse(result.responseText);

                    let tare = {};
                    for (let i = 0; i < tareData.length; i++) {

                        tare [tareData[i]["name"]] = {
                            id: tareData[i]["ID"],
                            name: tareData[i]["name"],
                            formula: tareData[i]["formula"],
                            count_unit: parseInt(tareData[i]["count_unit"]),
                            type: parseInt(tareData[i]["type"])
                        }
                    }

                    const gridPurshace = me.lookupReference("grid_purshace");
                    me.getView().INLINE_DATA["tare"] = tare;

                    if (me.getView().INLINE_DATA["is_activate"])
                        return;
                    me.getView().INLINE_DATA["is_activate"] = true;

                    me.generateColumnsTare(tare, gridPurshace);

                }
            },
            failure: function(result) {
                console.log(result);
            }
        })
    },

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
                        xtype: 'textfield',
                        listeners: {
                            focusleave: function (txt) {
                                me.onEditCostRecord(txt, {
                                    id_tare: value.id,
                                    cost: txt.getValue()
                                })
                            }
                        }
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
                        xtype: 'textfield',
                        listeners: {
                            focusleave: function (txt) {
                                me.onEditCostRecord(txt, {
                                    id_tare: value.id,
                                    cost: txt.getValue()
                                })
                            }
                        }
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
                'order': data["order"]
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);
                let
                    beforeData = [],
                    ship = 0,
                    supplier = '',
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
                    supplier = d["supplier"];
                    beforeData.push(d);

                    ids.baseIds.push(d["ID"]);
                }

                me.getView().lookupReference("txt_ship").setValue(ship);
                me.getView().lookupReference("txt_supplier").setValue(supplier);

                loadResultData(me, ids, beforeData);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })

        function loadResultData(me, ids, beforeData) {
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

                    let columns = [];
                    for (let j = 0; j < resultData.length; j++) {
                        let r = resultData[j];

                        let trns = r["tare_name"].toLowerCase().replace(" ", "_");
                        trns = me.toTranslit(trns);



                        if (r["type_tare"] == 2) {

                            if (!rrData[r["id_parent"]]) {
                                r["counter"] = kk++;
                                rrData[r["id_parent"]] = {
                                    rec: r,
                                    tare_cost: []
                                }
                            };

                            columns.push("unit_" + trns);
                            rrData[r["id_parent"]] ["unit_" + trns] = r["cost"];

                            if (rrData[r["id_parent"]]["tare_cost"]) {
                                rrData[r["id_parent"]]["tare_cost"].push({
                                    tare: r["id_tare"],
                                    cost: r["cost"],
                                    column: "unit_" + trns
                                })
                            }
                            console.log(3);
                        } else if (r["type_tare"] == 1) {

                            r["counter"] = kk++;
                            rrData[r["id_parent"]] = {
                                rec: r,
                                bottle_cost: r["cost"]
                            }


                            columns.push("bottle_cost");

                            r["tare_cost"] = [{
                                tare: r["id_tare"],
                                bottle_cost: r["cost"]
                            }]
                            ttData.push(r);
                        }
                    }

                    for (let i = 0; i < beforeData.length; i++) {

                        const unit = rrData[ beforeData[i]["ID"] ]; console.log(unit);console.log(beforeData[i]);console.log("==");
                        beforeData[i]["tare_cost"] = unit? unit.tare_cost : 0;
                        beforeData[i]["bottle_cost"] = unit? unit.bottle_cost : 0;
                        beforeData[i]["id_purshace"] = beforeData[i]["ID"];
                        columns.forEach( function(colname) {

                            if (unit)
                                beforeData[i][colname] = unit[colname];
                        })
                    }

                     me.getView().lookupReference("grid_purshace").getStore().loadData(beforeData);
                },
                failure: function (result) {
                    Ext.Msg.alert(result.responseText);
                }
            })
        }

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
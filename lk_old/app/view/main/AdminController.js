Ext.define('lk.view.main.AdminController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.admin',

    listen: {
        controller: {
            'amazing': {
                amazingEvent: 'loadStoreBrewery'
            }
        }
    },

    /* Обновить список задач */
    loadTasks: function () {
        // const gridTasks = this.getView().down("[name=gridTasks]");
        //
        // Ext.Ajax.request({
        //     method: 'GET',
        //     url: './php/classes/QueryPrice.php',
        //     params : {
        //         'query' : 'loadTasks'
        //     },
        //     success: function(result) {
        //         if (result && result.status === 200) {
        //             const data = JSON.parse(result.responseText);
        //             gridTasks.getStore().loadData(data);
        //         }
        //     },
        //     failure: function(result) {
        //         console.log(result);
        //     }
        // });
    },

    /* Отметить задачу выполненной */
    checkTask: function (rowmodel, record, index) {
        const grid = this.getView().down("[name=gridTasks]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryPrice.php',
            params : {
                'query' : 'checkTask',
                'id': record.data["id"]
            },
            success: function(result) {
                console.log(result.responseText);
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    /* Загрузить базу пива */
    loadBaseBeer: function () { return;
        const gridBaseBeer = this.getView().down("[name=gridBaseBeer]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryPrice.php',
            params : {
                'query' : 'loadBaseBeer'
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);
                    for (var i = 0; i < data.length; i++) {
                        if (data[i]["untuppd"]) {
                            data[i]["untuppd_view"] = "<a href='"+data[i]["untuppd"]+"' target='_blank'>"+data[i]["untuppd"]+"</a>";
                        }
                        else
                            data[i]["untuppd_view"] = "";
                    }
                    gridBaseBeer.getStore().loadData(data);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    /* Удаление сорта */
    onDeleteBaseBeer: function () {
            const me = this;
            const gridBeer = me.getView().down("[name=gridBaseBeer]");
            const selectRows = gridBeer.getSelection();

            if (selectRows.length === 0) {
                Ext.MessageBox.alert("Предупреждение", "Выберите строку");
                return;
            }

            var data = selectRows[0].data;

            Ext.Msg.confirm(
                "Удаление",
                "Вы действительно хотите удалить " + data[3] + "?",
                function (buttonId) {
                    if (buttonId === 'yes') {
                        for (let i = 0; i < selectRows.length; i++) {console.log(data);
                            Ext.Ajax.request({
                                method: 'GET',
                                url: './php/classes/QueryKitchen.php',
                                params : {
                                    'query' : 'deleteBeer',
                                    'id': data[0]
                                },
                                success: function(result) {
                                    if (result && result.status === 200) {
                                        me.loadBaseBeer();
                                    }
                                },
                                failure: function(result) {
                                    console.log(result);
                                }
                            });
                        }
                    }
                });
    },

    onAddBaseBeer: function () {
        var me = this.getView();
        Ext.create({
            xtype: 'winbeer',
            stores: {
                brewery: me.stores.brewery,
                typestyle: me.stores.typestyle
            },
            parentWin: me
        }).show();
    },

    onEditBaseBeer: function () {
        const me = this;
        const myView = this.getView();
        const gridBeer = this.getView().down("[name=gridBaseBeer]");
        const selectRows = gridBeer.getSelection();

        if (selectRows.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }
        var data = selectRows[0].data;

        Ext.create({
            xtype: 'winbeer',
            isAdd: false,
            stores: {
                brewery: myView.stores.brewery,
                typestyle: myView.stores.typestyle
            },
            parentController: me,
            InitData: {
                id_beer: data[0],
                id_brewery: data[1],
                name: data[3],
                style: data[4],
                id_type_1: data[5],
                id_type_2: data[7],
                id_type_3: data[9],
                abv: data[11],
                og: data[12],
                ibu: data[13],
                untuppd: data[14],
                vol: data[15]
            }

        }).show();
    },

    /* Показать окно редактирования пивоварен */
    onWinBrew: function () {
        const win = Ext.create('lk.view.main.Brewery');
        win.show();
    },

    loadStores: function () {
        this.loadStoreBrewery();
        this.loadStoreTypeStyle();
    },

    loadStoreBrewery: function () {
        const me = this;

        // if (me.getView().stores.brewery)
        //     return;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryPrice.php',
            params : {
                'query' : 'loadBrew'
            },
            success: function(result) {
                if (result && result.status === 200) {
                    const data = JSON.parse(result.responseText);
                    me.getView().stores.brewery = Ext.create({
                        xtype: 'storebrewery'
                    });
                    me.getView().stores.brewery.loadData(data);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    loadStoreTypeStyle: function () {
        const me = this;

        // if (me.getView().stores.typestyle)
        //     return;

        // Ext.Ajax.request({
        //     method: 'GET',
        //     url: './php/classes/QueryPrice.php',
        //     params : {
        //         'query' : 'loadTypeStyle'
        //     },
        //     success: function(result) {
        //         if (result && result.status === 200) {
        //             const data = JSON.parse(result.responseText);
        //             me.getView().stores.typestyle = Ext.create({
        //                 xtype: 'storetypestyle'
        //             });
        //             me.getView().stores.typestyle.loadData(data);
        //         }
        //     },
        //     failure: function(result) {
        //         console.log(result);
        //     }
        // });
    },

    //Загрузить сорта из Google-таблицы
    loadBeerFromTable: function () {
        const me = this;

        Ext.Msg.show({
            title : 'Загрузка сортов',
            width : 300,
            buttons : Ext.Msg.YESNO,
            buttonText :
                {
                    yes : 'Загрузить',
                    no : 'Отмена'
                },
            msg: 'Введите номера строк<br>Строка 1: <input type="text" id="row1" /><br/>Строка 2: <input type="text" id="row2" />',
            fn: function (button)
            {
                var row1 = document.getElementById('row1').value;
                var row2 = document.getElementById('row2').value;

                Ext.Ajax.request({
                    method: 'GET',
                    url: './php/classes/QueryPrice.php',
                    params : {
                        'query' : 'getBeerFromGoogleTable'
                    },
                    success: function(result) {
                        if (result && result.status === 200) {
                            let data = JSON.parse(result.responseText);
                            let tdata = data.slice(row1-1, row2);

                            me.pushGoogleToBase(tdata);
                        }
                    },
                    failure: function(result) {
                        console.log(result);
                    }
                });
            }
        });
    },

    pushGoogleToBase: function (tdata) {
        const me = this;
        let all_brews = this.getView().stores.brewery.data.items;
        let not_findbrew_str = "";
        let error = {
            flag: 0,
            message: ""
        };

        tdata.forEach(function (value) {
            let rez = -1;
            if (value[0].length === 0) {
                error.flag = 1;
                error.message = "Не указана пивоварня у сорта "+value[1]+"<br>Добавление невозможно";
                return;
            }
            if (value[1].length === 0) {
                error.flag = 1;
                error.message = "Не указано наименование сорта<br>Добавление невозможно";
                return;
            }
            if (value[3].length === 0) {
                error.flag = 1;
                error.message = "Не указан ТИП 1 сорта "+ value[1] +"<br>Добавление невозможно";
                return;
            }
            all_brews.forEach(function (value2) {
                if (value[0] === value2.data["name"]) {
                    rez = 1;
                    return;
                }
            });
            if (rez === -1)
                not_findbrew_str += value[0] + ", ";
        });

        if (not_findbrew_str.length > 0) {
            error.flag = 1;
            error.message = "Пивоварен:<br><i>"+not_findbrew_str+"</i><br>нет в базе!<br>Добавление невозможно";
        }

        if (error.flag === 1) {
            Ext.MessageBox.alert("Ошибка", error.message);
            return;
        }


        tdata.forEach(function (value) {

            let query = "CALL insertBeerByText (";
            query += "'" + value[0] + "'";
            query += ", '" + value[1] + "'";
            query += ", '" + value[2] + "'";
            query += ", '" + value[3] + "'";
            query += ", '" + value[4] + "'";
            query += ", '" + value[5] + "'";
            query += ", " + (value[6]? value[6] : 'null');
            query += ", " + (value[7]? value[7] : 'null');
            query += ", " + (value[8]? value[8] : 'null');
            query += ", '" + value[9] + "'";
            query += ", " + (value[10]? value[10] : 'null');
            query += ");";

            Ext.Ajax.request({
                method: 'GET',
                url: './php/classes/QueryPrice.php',
                params : {
                    'query' : 'addManyBeer',
                    'query_text' : query,
                    'beer_name' : value[1],
                    'brew_name' : value[0]
                },
                success: function(result) { console.log(result);
                    if (result && result.status !== 200) {
                        Ext.Msg.alert("Ошибка", "Ошибка добавление сорта "+value[1]);
                    }
                    else
                        me.loadBaseBeer();
                },
                failure: function(result) {
                    console.log(result);
                }
            });
        });


    }


});
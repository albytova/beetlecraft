Ext.define('lk.view.main.KitchenController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.kitchen',

    /* Первоначальная загрузка данных */
    load: function () {
        // this.loadDraft();
        // this.loadBottle();
    },

    /* Обработчик кнопки "Обновить краны" */
    onReloadDraft: function () {
        this.loadDraft();
    },

    /* Обработчик кнопки "Обновить бутылки" */
    onReloadBottle: function () {
        this.loadBottle();
    },

    /* Загрузка таблицы с бутылками */
    loadBottle: function () {
        const gridBottle = this.getView().down("[name=gridBottle]");
        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryKitchen.php',
            params : {
                'query' : 'getBottle'
            },
            success: function(result) {
                if (result && result.status === 200) {
                    const data = JSON.parse(result.responseText);
                    gridBottle.getStore().loadData(data);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    /* Загрузка таблицы с кранами */
    loadDraft: function () {
        const gridDraft = this.getView().down("[name=gridDraft]");
        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryKitchen.php',
            params : {
                'query' : 'getDraft'
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);
                    var bdata = [], gdata = {};
                    for (let i = 0; i < data.length; i++) {
                        data[i]["num_view"] = data[i]["num"] === "100"? "" : data[i]["num"];

                        if (data[i]["num"] === "100")
                            bdata.push(data[i]);
                        else
                            gdata[ data[i]["num"] ] = data[i];
                    }
                   // gridDraft.getStore().loadData(data);

                    var shablon = {num: 1, num_view: "1", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null};
                    var ddata = [
                        gdata[1]? gdata[1] : {num: 1, num_view: "1", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[2]? gdata[2] : {num: 2, num_view: "2", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[3]? gdata[3] : {num: 3, num_view: "3", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[4]? gdata[4] : {num: 4, num_view: "4", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[5]? gdata[5] : {num: 5, num_view: "5", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[6]? gdata[6] : {num: 6, num_view: "6", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[7]? gdata[7] : {num: 7, num_view: "7", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[8]? gdata[8] : {num: 8, num_view: "8", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[9]? gdata[9] : {num: 9, num_view: "9", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[10]? gdata[10] : {num: 10, num_view: "10", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[11]? gdata[11] : {num: 11, num_view: "11", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[12]? gdata[12] : {num: 12, num_view: "12", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[13]? gdata[13] : {num: 13, num_view: "13", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null},
                        gdata[14]? gdata[14] : {num: 14, num_view: "14", name: "", brewery: "", dist: "", abv: null, date_smm: null, coin_300: null, coin_500: null}
                    ];


                    for (var i = 0; i < bdata.length; i++) {
                        ddata.push(bdata[i]);
                    }

                    gridDraft.getStore().loadData(ddata);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    /* Установить дату выкладывания поста */
    onSetDateSMM: function () {

        const me = this;
        const gridDraft = this.getView().down("[name=gridDraft]");
        const selectedRow = gridDraft.getSelectionModel().getSelection();
        if (selectedRow.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }

        Ext.Msg.prompt(
            "Когда выкладывать пост",
            "Укажите дату в формате [год-месяц-день] (пример, 2022-04-01)",
            function (answer, text) {

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/classes/QueryKitchen.php',
                        params : {
                            'query' : 'setDateSMM',
                            'id': selectedRow[0].data["id"],
                            'date_smm': text.length > 0? "'"+text+"'" : "null"
                        },
                        success: function(result) {
                            if (result && result.status === 200) {
                                me.loadDraft();
                            }
                        },
                        failure: function(result) {
                            console.log(result);
                        }
                    });
                
            });
    },





    /* Удалить кег */
    onDeleteDraft: function () {

        const me = this;
        const gridDraft = this.getView().down("[name=gridDraft]");
        const selectedRow = gridDraft.getSelectionModel().getSelection();

        if (selectedRow.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }

        Ext.Msg.confirm(
            "Удаление",
            "Вы действительно хотите удалить " + selectedRow[0].data["name"] + "?",
            function (buttonId) {
                if (buttonId === 'yes') {
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/classes/QueryKitchen.php',
                        params : {
                            'query' : 'deleteTap',
                            'id': selectedRow[0].data["id"],
                            name: selectedRow[0].data["name"],
                            brewery: selectedRow[0].data["brewery"]
                        },
                        success: function(result) {
                            if (result && result.status === 200) {
                                me.loadDraft();
                                me.sendTaskMessage("Удалить Розлив: "+selectedRow[0].data['name']);
                            }
                        },
                        failure: function(result) {
                            console.log(result);
                        }
                    });
                }
            });
    },

    /* Показать окно добавления кеги */
    onAddDraft: function () {
        Ext.create({
            xtype: 'wincreatedraft',
            parentcontroller: this
        }).show();
    },

    /* Показать окно релактирования кеги */
    onEditDraft: function () {
        const me = this;
        const gridDraft = this.getView().down("[name=gridDraft]");
        const selectedRow = gridDraft.getSelectionModel().getSelection();

        if (selectedRow.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }

        Ext.create({
            xtype: 'wincreatedraft',
            parentcontroller: this,
            isAdd: false,
            InitData: {
                id: selectedRow[0].data['id'],
                num: selectedRow[0].data['num'] === '100'? '100' : selectedRow[0].data['num'],
                name: selectedRow[0].data['name'],
                brew: selectedRow[0].data['brewery'],
                abv: selectedRow[0].data['abv'],
                ibu: selectedRow[0].data['ibu'],
                dist: selectedRow[0].data['dist'],
                cost300: selectedRow[0].data['coin_300'],
                cost500: selectedRow[0].data['coin_500']
            }
        }).show();
    },

    /* Отправка уведомления в телеграм с задачами */
    sendTaskMessage: function (text) {
        Ext.Ajax.request({
            url : "https://api.telegram.org/bot5218570218:AAF73Bcx757bZdI572qdz14tEopq5spiIvY/sendMessage?chat_id=-1001799024183&parse_mode=html&text="+text,
            method : 'GET',
            success : function () {
                console.log('send task');
            },
            error : function (err) {
                console.log (err);
            }
        });
    },

    /* Установка номера крана */
    onSetTap: function () {
        const me = this;
        const gridDraft = this.getView().down("[name=gridDraft]");
        const selectedRow = gridDraft.getSelectionModel().getSelection();
        if (selectedRow.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }

        Ext.Msg.prompt(
            "Поставить на кран",
            "Укажите номер крана",
            function (answer, text) {
                if (text) {
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/classes/QueryKitchen.php',
                        params : {
                            'query' : 'setTap',
                            'id': selectedRow[0].data["id"],
                            'num': text,
                            'name': selectedRow[0].data["name"],
                            'brewery': selectedRow[0].data["brewery"]
                        },
                        success: function(result) {
                            if (result && result.status === 200) {
                                me.loadDraft();
                                me.sendTaskMessage("Поставить на кран №"+text+" "+selectedRow[0].data["name"]);
                            }
                        },
                        failure: function(result) {
                            console.log(result);
                        }
                    });
                }
            });
    },

    /* Удаление бутылки */
    onDeleteBottle: function () {
        const me = this;
        const gridBottle = this.getView().down("[name=gridBottle]");
        const selectRows = gridBottle.getSelection();

        if (selectRows.length === 0) {
            Ext.MessageBox.alert("Предупреждение", "Выберите строку");
            return;
        }

        let text = ", ";
        for (let i = 0; i < selectRows.length; i++) {
            text += selectRows[i].data["beer_name"] + ", ";
            console.log(selectRows[i].data);
        }
        text = text.slice(0, text.length - 2);

        Ext.Msg.confirm(
            "Удаление",
            "Вы действительно хотите удалить " + text + "?",
            function (buttonId) {
                if (buttonId === 'yes') {
                    for (let i = 0; i < selectRows.length; i++) {
                        Ext.Ajax.request({
                            method: 'GET',
                            url: './php/classes/QueryKitchen.php',
                            params : {
                                'query' : 'deleteBottle',
                                'id': selectRows[i].data["bottle_id"],
                                'beer_name': selectRows[i].data["beer_name"],
                                'beer_brewery': selectRows[i].data["brewery_name"]
                            },
                            success: function(result) {
                                if (result && result.status === 200) {
                                    me.loadBottle();
                                    me.sendTaskMessage("Удалить Стекло: " + selectRows[i].data['beer_name'] + " (" + selectRows[0].data['brewery_name'] + ")");
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

    /* Отображение окна добавления бутылки */
    onAddBottle: function () {

    },

    /* Выделение строки таблицы с бутылками */
    selectBottleRow: function (view, record) {
        const lblBottleDist = this.getView().down("[name=lblBottleDist]");
        let text = "<p><font size='4'>"+record.data["beer_name"]+"</font><br>Пивоварня: <b>"+record.data["brewery_name"]+"</b>";
        text += ", "+record.data["style"];

        text += "<br>"+record.data["type_text1"];
        if (record.data["type_text2"])
            text += ", "+record.data["type_text2"];
        if (record.data["type_text3"])
            text += ", "+record.data["type_text3"];

        if (record.data["abv"])
            text += ", abv "+record.data["abv"]+"%";
        if (record.data["og"])
            text += ", og "+record.data["og"]+"%";
        if (record.data["ibu"])
            text += ", ibu "+record.data["og"];
        if (record.data["vol"])
            text += "<br><font color='#8b0000'>Объём "+record.data["vol"]+"мл</font>";
        if (record.data["cost"])
            text += "  <font color='#00008b'>Цена "+record.data["cost"]+"мл</font>";
        if (record.data["is_cen"] == 0)
            text += "   НЕТ ЦЕННИКА";

        text += "</p>";

        lblBottleDist.setHtml(text);

    }
});

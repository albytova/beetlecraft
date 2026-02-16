Ext.define('beetlecraft.view.main.Shift.ShiftController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.shift',

    /* Активация вкладки */
    onActivate: function () {
        const me = this;

            me.reloadShifts();

            // Ext.Ajax.request({
            //     method: 'GET',
            //     url: './php/Shift.php',
            //     params: {
            //         'query': 'getShifts',
            //         'id_shop' : localStorage.getItem("ShopID")
            //     },
            //     success: function (result) {
            //         const ddData = JSON.parse(result.responseText);
            //
            //         me.loadShifts(ddData);
            //     },
            //     failure: function (result) {
            //         Ext.Msg.alert("Внимание", result.responseText);
            //     }
            // })

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Shift.php',
                params: {
                    'query': 'getCash'
                },
                success: function (result) {
                    const ddData = JSON.parse(result.responseText);
                    if (ddData.length > 0)
                        me.getView().lookupReference("lbl_main_cash_box").setHtml('В кассе: ' + ddData[0]["cash"] + "руб");
                },
                failure: function (result) {
                    Ext.Msg.alert("Внимание", result.responseText);
                }
            })

    },

    /* Изъять наличные в кассе */
    onOutBox: function () {

        const me = this;

        Ext.Msg.prompt('Изъятие наличных', 'Введите сумму', function(buttonId, value) {

            if (!value)
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Shift.php',
                params: {
                    'query': 'toOutCash',
                    'money' : value
                },
                success: function (result) {

                    result = JSON.parse(result.responseText);

                    let message = "Изъятие наличных из кассы:\n\n";
                    message += "Изъято: " + value + "руб\n";
                    message += "Сейчас в кассе: " + result + "руб";
                    me.sendMessageTG(message);

//                    me.getView().lookupReference("lbl_new_cash_old").setHtml("Было в кассе: " + new_cash);
//                    me.getView().lookupReference("lbl_new_cach").setHtml("Сейчас в кассе: " + new_cash);
                    me.getView().InlineData["money_cash_at_box"] = result;
                    me.getView().lookupReference("lbl_main_cash_box").setHtml('В кассе: ' +  result + "руб");

                    me.reloadShifts();
                },
                failure: function (result) {
                    Ext.Msg.alert("Внимание", result.responseText);
                }
            })
        })
    },

    /* Задать количество наличных в кассе */
    onCashToBox: function () {

        const me = this;

        Ext.Msg.prompt('Внесение наличных', 'Введите сумму наличных в кассе', function(buttonId, value) {

            if (!value)
                return;

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Shift.php',
                params: {
                    'query': 'addCashToBox',
                    'money' : value
                },
                success: function (result) {

                    let message = "Изменение суммы наличных в кассе:\n\n";
                    message += "Было: " + me.getView().InlineData["money_cash_at_box"] + "руб\n";
                    message += "Стало: " + value + "руб";
                    me.sendMessageTG(message);

//                    me.getView().lookupReference("lbl_new_cash_old").setHtml("Было в кассе: " + value);
//                    me.getView().lookupReference("lbl_new_cach").setHtml("Сейчас в кассе: " + value);
                    me.getView().InlineData["money_cash_at_box"] = parseInt(result);
                    me.getView().lookupReference("lbl_main_cash_box").setHtml('В кассе: ' +  value + "руб");

                    me.reloadShifts();
                },
                failure: function (result) {
                    Ext.Msg.alert("Внимание", result.responseText);
                }
            })
        })
    },

    sendMessageTG: function (message) {

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
                console.log(result);
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    },

    loadShifts: function (ddData) {

        const me = this;

        const dt_today = new Date;
        let dt_last_shift = new Date(ddData[0]["date_shift"]);
        const diffDay = Ext.Date.diff(dt_last_shift, dt_today, "d");
        let shData = [];

        for (let i = diffDay; i > 0; i--) {

            let ss = Ext.Date.add(dt_last_shift, Ext.Date.DAY, i);
            addShift(Ext.Date.format(ss, "Ymdhis"));
        }

        setTimeout(me.reloadShifts(), 2000);

        function addShift(date_shift) {

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Shift.php',
                params: {
                    'query': 'addShift',
                    'date_shift': date_shift
                },
                success: function (result) {
                    console.log(result.responseText);
                },
                failure: function (result) {
                    Ext.Msg.alert("Внимание", result.responseText);
                }
            })
        }

    },

    onLoadShiftInfo: function (dv, location) {

        const me = this;
        const dataPP = location.record.data;

        const pnlCloseShift = me.getView().lookupReference("pnl_close_shift");
        const pnlNewShift = me.getView().lookupReference("pnl_new_shift");

        const ddShifts = Ext.data.StoreManager.lookup("storeShift").getData().items;
        const cash_old = ddShifts[1] && ddShifts[1].data["money_cash_at_box"]? ddShifts[1].data["money_cash_at_box"] : 0;

        const is_close_shift = dataPP["is_close"] == "1" ? true : false;

        pnlCloseShift.setHidden(!is_close_shift);
        pnlNewShift.setHidden(is_close_shift);

        const dtCurrent = Ext.Date.format(new Date(dataPP["date_shift"]), "d.m.Y");
        if (is_close_shift) {
            me.getView().lookupReference("lbl_close_date_shift").setHtml("<h3>Дата Смены:  " + dtCurrent + "</h3>");
            me.loadCloseShift(dataPP["id"]);
        } else {
            me.getView().InlineData["date_shift"] = new Date(dataPP["date_shift"]);
            me.getView().InlineData["id_shift"] = dataPP["id"];
            me.getView().lookupReference("lbl_new_date_shift").setHtml("<h3><font color='#006400'>Дата Смены:  " + dtCurrent + "</font></h3>");

            // me.getView().lookupReference("lbl_new_cash_old").setHtml("Было в кассе: " + cash_old);
            // me.getView().lookupReference("lbl_new_cach").setHtml("Сейчас в кассе: " + cash_old);
            me.getView().InlineData["money_cash_at_box"] = parseInt(cash_old);
        }
    },

    clearNewShift: function () {

        this.InlineData = {
            "date_shift": null,
            "id_shift": null,
            "money_cash_at_box": 0,
            "new_money_all": 0,
            "new_money_sber": 0,
            "new_money_tochka": 0,
            "new_money_transfer": 0,
            "new_money_credit_all": 0
        }

        this.getView().lookupReference("lbl_new_money_all").clearValue();
        this.getView().lookupReference("lbl_new_money_sber").clearValue();
        this.getView().lookupReference("lbl_new_money_tochka").clearValue();
        this.getView().lookupReference("lbl_new_money_transfer").clearValue();

 //       this.getView().lookupReference("lbl_new_cash_old").setHtml("Было в кассе: ");
        this.getView().lookupReference("lbl_cash_shift").setHtml("Наличными за смену: ");
        //this.getView().lookupReference("lbl_new_money_credit_all").setHtml("Долги за смену: ");
//        this.getView().lookupReference("lbl_new_cach").setHtml("Сейчас в кассе: ");
    },

    loadCloseShift: function (id_shift) {

        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Shift.php',
            params: {
                'query': 'getCloseShift',
                'id_shift': id_shift
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);

                me.getView().lookupReference("lbl_close_money_all").setValue(ddData[0]["money_all"]);
                me.getView().lookupReference("lbl_close_money_cash").setValue(ddData[0]["money_cash"]);
                me.getView().lookupReference("lbl_close_money_acquiring").setValue(ddData[0]["money_acquiring"]);
                me.getView().lookupReference("lbl_close_barmen").setValue(ddData[0]["name"]);
                me.getView().lookupReference("lbl_close_money_transfer").setValue(ddData[0]["money_transfer"]);
                //me.getView().lookupReference("lbl_close_money_credit").setValue(ddData[0]["money_credit"]);
                me.getView().lookupReference("lbl_close_money_cash").setValue(ddData[0]["money_cash"]);
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    onMoneyChange: function (field, newValue, oldValue) {

        const me = this;
        switch (field.reference) {
            case "lbl_new_money_all":
                me.changeMoney("new_money_all", parseInt(newValue));
                break;

            case "lbl_new_money_sber":
                me.changeMoney("new_money_sber", parseInt(newValue));
                break;

            case "lbl_new_money_tochka":
                me.changeMoney("new_money_tochka", parseInt(newValue));
                break;

            case "lbl_new_money_transfer":
                me.changeMoney("new_money_transfer", parseInt(newValue));
                break;
        }
    },


    /* Добавление долга */
    onAddCredit: function () {

        const me = this;

        const winCredit = Ext.create({
            xtype: 'window',
            title: 'Добавление долга',

            maximizable: true,
            bodyPadding: 10,

            items: [

                {
                    xtype: 'textfield',
                    reference: 'txt_credit_name',
                    name: 'txt_credit_name',
                    label: 'Имя клиента'
                },
                {
                    xtype: 'numberfield',
                    reference: 'txt_сredit_sum',
                    name: 'txt_сredit_sum',
                    label: 'Сумма'
                }
            ],

            buttons: {
                close: function () {
                    winCredit.destroy();
                },
                save: function () {
                    const credit_name = winCredit.down("[name=txt_credit_name]").getValue();
                    const credit = winCredit.down("[name=txt_сredit_sum]").getValue();

                    if (!credit || !credit_name) {
                        Ext.Msg.alert("Внимание", "Поля не заполнены");
                    }

                    me.changeMoney("new_money_credit_all", parseInt(credit));

                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/Shift.php',
                        params: {
                            'query': 'addCredit',
                            'name': credit_name,
                            'money': credit
                        },
                        success: function (result) {
                            console.log(result.responseText);
                        },
                        failure: function (result) {
                            Ext.Msg.alert("Внимание", result.responseText);
                        }
                    })

                    winCredit.destroy();
                }
            }
        }).show()
    },

    /* Пересчет сумм */
    changeMoney: function (field, value) {

        if (field == "new_money_credit_all")
            this.getView().InlineData[field] = value ? value + this.getView().InlineData[field] : 0;
        else
            this.getView().InlineData[field] = value ? value : 0;

        let cash_shift = this.getView().InlineData["new_money_all"] - this.getView().InlineData["new_money_sber"] - this.getView().InlineData["new_money_tochka"] - this.getView().InlineData["new_money_transfer"] - this.getView().InlineData["new_money_credit_all"];
        let result = this.getView().InlineData["money_cash_at_box"] + cash_shift;

        this.getView().lookupReference("lbl_cash_shift").setHtml("Наличными за смену: " + cash_shift);
 //       this.getView().lookupReference("lbl_new_cach").setHtml("Сейчас в кассе: " + result);
       // this.getView().lookupReference("lbl_new_money_credit_all").setHtml("Долги за смену: " + this.getView().InlineData["new_money_credit_all"]);
    },

    /* Закрытие смены */
    onCloseShift: function () {

        const me = this;
        const moneyData = me.getView().InlineData;

        const gridShifts = this.getView().lookupReference("grid_shift");
        let rec = gridShifts.getSelection();

        if (!rec)
            return;

        const date_shift = Ext.Date.format(new Date(rec.data["date_shift"]), "d.m.Y");
        const now_date = Ext.Date.format(new Date, "d.m.Y H:m");

        Ext.Msg.confirm('Закрытие смены', 'Вы действительно хотите закрыть смену?', function (buttonId) {


            if (buttonId != 'yes')
                return;

            if (!moneyData["new_money_all"]) {
                Ext.Msg.alert("Внимание", "Выручка за заполнена");
                return;
            }

            const cash_shift = moneyData["new_money_all"] - moneyData["new_money_sber"] - moneyData["new_money_tochka"] - moneyData["new_money_transfer"] - moneyData["new_money_credit_all"];
            const eqv = parseInt(moneyData["new_money_sber"]) + parseInt(moneyData["new_money_tochka"]);

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Shift.php',
                params: {
                    'query': 'closeShift',
                    'id_shift': moneyData["id_shift"],
                    'money_all': moneyData["new_money_all"],
                    'money_acquiring': eqv,
                    'money_transfer': moneyData["new_money_transfer"],
                    'money_credit': moneyData["new_money_credit_all"],
                    'money_cash_at_box': moneyData["money_cash_at_box"] + cash_shift,
                    'money_cash': cash_shift,
                    'id_user': localStorage.getItem("UserID")
                },
                success: function (result) {

                    const cash = parseInt(result.responseText);

                    if (cash != 0) {

                        me.getView().InlineData["money_cash_at_box"] = parseInt(cash);
                        me.getView().lookupReference("lbl_main_cash_box").setHtml('В кассе: ' +  cash + "руб");

                        me.reloadShifts();
                        me.getView().lookupReference("pnl_new_shift").setHidden(true);

                        let message = "Закрытие смены от "+ date_shift +"\n\n";
                        message += "Смена закрыта " + now_date + "\n";
                        message += "Выручка: " + moneyData["new_money_all"] + "руб\n";
                        message += "Оплата по картам: " + eqv + "руб\n";
                        message += moneyData["new_money_transfer"]? "Оплата переводами: " + moneyData["new_money_transfer"] + "руб\n" : "";
                        //message += moneyData["new_money_credit_all"]? "В долг: " + moneyData["new_money_credit_all"] + "руб\n" : "";
                        message += "\nСейчас в кассе: " + cash + "руб\n";

                        me.sendMessageTG(message);

                        me.clearNewShift();
                    }
                },
                failure: function (result) {
                    Ext.Msg.alert("Внимание", result.responseText);
                }
            })
        })
    },

    /* Отображение окна с долгами */
    onCredit: function () {

        const me = this;
        const winCredit = Ext.create({
            xtype: 'window',
            title: 'Долги',

            maximizable: true,
            bodyPadding: 10,
            height: "500px",
            width: "500px",

            tbar: [

                {
                    xtype: 'button',
                    text: "Погасить долги",
                    handler: function () {

                        Ext.Msg.prompt('Погасить долги', 'Введите погашенную сумму', function (buttonId, value) {


                            if (buttonId != 'ok')
                                return;

                            const gridCredit = winCredit.down("[name=grid_credit]");
                            let rec = gridCredit.getSelection();

                            if (!rec) {
                                Ext.Msg.alert("Внимание", "Долги не выбраны");
                                return;
                            }

                            Ext.Ajax.request({
                                method: 'GET',
                                url: './php/Shift.php',
                                params: {
                                    'query': 'closeCredits',
                                    id: rec.data["id"],
                                    money: rec.data["money"] - value
                                },
                                success: function (result) {

                                    Ext.data.StoreManager.lookup("storeCredit").reload();
                                },
                                failure: function (result) {
                                    Ext.Msg.alert("Внимание", result.responseText);
                                }
                            })

                        })
                    }
                }
            ],

            items: [

                {
                    xtype: 'grid',
                    name: 'grid_credit',
                    reference: 'grid_credit',

                    minHeight: "500px",
                    scrollable: true,

                    store: {
                        autoLoad: true,
                        storeId: 'storeCredit',
                        fields: [
                            "id", "name", "money"
                        ],
                        proxy: {
                            type: 'ajax',
                            method: 'GET',
                            url: './php/Shift.php',
                            extraParams: {
                                'query': 'getCreditAll'
                            }
                        }
                    },

                    columns: [
                        {
                            text: 'Название',
                            dataIndex: 'name',
                            flex: 1
                        },
                        {
                            text: 'Сумма',
                            dataIndex: 'money',
                            flex: 1
                        }
                    ]
                }
            ],

            buttons: {
                close: function () {
                    winCredit.destroy();
                }
            }
        }).show()
    },

     /* Обновление таблицы смен */
    reloadShifts: function () {
        const me = this;
        const gridShift = me.getView().lookupReference("grid_shift");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Shift.php',
            params: {
                'query': 'getShifts'
            },
            success: function (result) {
                const ddData = JSON.parse(result.responseText);

                gridShift.getStore().loadData(ddData);
                gridShift.refresh();
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    /* Загрузка файла продаж */
    onLoadSalesFile: function () {
        const me = this;
        let form = me.getView().lookupReference("form_loadfile");

        if (!form.isValid()) {
            Ext.Msg.alert('Ошибка', 'Пожалуйста, выберите файл');
            return;
        }

        const gridShift = me.getView().lookupReference("grid_shift");
        let selectedRecord = gridShift.getSelection();
        if (!selectedRecord) {
            Ext.Msg.alert("Внимание", "Смена не выбрана");
            return;
        };

        form.submit({
            url: './php/Shift.php',
            method: 'POST', // Измените на POST для загрузки файлов
            waitMsg: 'Обработка файла продаж...',
            params: {
                'query': 'loadSalesFile',
                'id_shift': selectedRecord.data["id"]
            },
            success: function(form, action) {
                let response = action;
                console.log('Ответ сервера:', response);

                if (response.success) {
                    Ext.Msg.alert('Успех', 'Файл продаж успешно обработан!');
                    const field = me.getView().lookupReference("fld_text_loadfile");
                    field.reset();
                    me.reloadShifts();
                    me.sendActualStorageInfo(selectedRecord.data["date_shift"]);

                } else {
                    Ext.Msg.alert('Ошибка', response.message);
                }
            },
            failure: function(form, action) {
                console.error('Ошибка формы:', action);
                Ext.Msg.alert('Ошибка', 'Произошла ошибка при загрузке файла');
            }
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
        });
    },

    /* Отправить сообщение в телеграм с актуальными остатками */
    sendActualStorageInfo: function (date_shift) {

        const me = this;

        const date = new Date(date_shift);
        const date_format = [
            String(date.getDate()).padStart(2, '0'),
            String(date.getMonth() + 1).padStart(2, '0'),
            date.getFullYear()
        ].join('.');

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Shift.php',
            params: {
                'query': 'getActualStorage',
                'date_shift': date_format
            },
            success: function (result) {
                const message = result.responseText;

                console.log(message);

                me.sendTelegram(message);
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    }
});
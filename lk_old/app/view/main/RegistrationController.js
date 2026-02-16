Ext.define('lk.view.main.RegistrationController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.registration',

    NeedCard: false,

    onInput: function (sender) {
        const
            formInput = this.getView().down("[name=formInput]");

        formInput.getForm().submit({
            clientValidation: false,
            url: './php/classes/Query.php',
            params : {
                'functionname': 'inputUser'
            },
            success: submitReturn,
            failure: submitReturn
        });

        function submitReturn(form, action) {

            if (action.result >= 1) {
                console.log('пароль верный');

                Ext.Ajax.request({
                    method: 'POST',
                    url: './php/classes/Query.php',
                    params : {
                        'functionname': 'getUserInfo',
                        'numcard': action.result
                    },
                    success: function(res) {
                        let data = JSON.parse(res.responseText);
                        const main = formInput.up("[name=app-main]");

                        let rights = '' + data["rights"];

                        main.UserInfo = {
                            isReg: true,
                            name: data["name"],
                            surname: data["surname"],
                            numcard: data["num"],
                            untuppd: data["untuppd"],
                            phone: data["phone"],
                            birthday: data["birthday"]
                        };

                        main.UserInfo.isAdmin = (rights.indexOf('0') > -1 || rights.indexOf('1') > -1); console.log(main.UserInfo.isAdmin);
                        main.UserInfo.isCook = (rights.indexOf('0') > -1 || rights.indexOf('2') > -1);console.log(main.UserInfo.isCook);
                        main.UserInfo.isSmm = (rights.indexOf('0') > -1 || rights.indexOf('3') > -1);console.log(main.UserInfo.isSmm);

                        Ext.util.Cookies.set("UserInfo", JSON.stringify(main.UserInfo)); //todo добавить уведомление пользователю о сохранении кукей

                        main.remove(main.items.getAt(0));
                        main.insert(0,
                            {
                                xtype: 'panel',
                                title: 'Профиль',
                                items: [{
                                    xtype: 'profil'
                                }]
                            });

                        if (main.UserInfo.isAdmin) {
                            main.insert(1, {
                                xtype: 'panel',
                                title: 'Админ',
                                items: [{
                                    xtype: 'admin'
                                }]
                            });
                            main.insert(2, Ext.create({
                                xtype: 'beetleprof',
                                title: 'BeetleCraft'
                            }));
                            // main.insert(3, Ext.create({
                            //     xtype: 'listbeer',
                            //     title: 'Пиво'
                            // }))
                            // main.insert(4, Ext.create({
                            //     xtype: 'analytics',
                            //     title: 'Аналитика'
                            // }))
                        }

                        if (main.UserInfo.isCook) {
                            main.insert(1, Ext.create({
                                xtype: 'kitchen',
                                title: 'Замедление'
                            }));
                        }

                        if (main.UserInfo.isSmm) {
                            main.insert(1, Ext.create({
                                xtype: 'smm',
                                title: 'SMM'
                            }));
                        }
                    },
                    failure: function(rez) {
                        console.log(rez);
                    }
                })
            }
            else
                console.log('пароль неверный');
        }
    },

    onReg: function () {
        let panel = this.getView();
        panel.NeedCard = false;

        Ext.Msg.show({
            title: 'Вопрос',
            message: 'У вас есть дисконтная карта?',
            width: 300,
            buttons: Ext.Msg.YESNOCANCEL,
            buttonText: {
                yes: 'Да',
                no: 'Нет',
                cancel: 'Отмена'
            },
            fn: function (rez) {
                if (rez === 'yes') {
                    panel.down("[name=formInput]").setHidden(true);
                    let regForm = panel.down("[name=formReg]");
                    regForm.setHidden(false);
                    regForm.down("[name=cntRegCard]").setHidden(true);
                    regForm.down("[name=regNumCard]").setHidden(false);
                }
                else {
                    panel.down("[name=formInput]").setHidden(true);
                    let regForm = panel.down("[name=formReg]");
                    regForm.setHidden(false);
                    regForm.down("[name=regNumCard]").setHidden(true);
                    regForm.down("[name=cntRegCard]").setHidden(false);
                    panel.NeedCard = true;
                }
            }
        });
    },

    onSendReg: function (sender) {
        const
            formReg = sender.up("[name=formReg]"),
            panel = this.getView(),
            controller = this,
            untuppdText = formReg.down("[name=regUntappd]").getValue();

        formReg.getForm().submit({
            clientValidation: false,
            url: './php/classes/Query.php',
            params : {
                'functionname': 'regUser',
                'needcard': panel.NeedCard === true? 1 : 0
            },
            success: submitReturn,
            failure: submitReturn
        });

        //todo добавить отдельную проверку на существование дисконтной карты
        //todo верификация по email или телефону
        //todo добавить забыли пароль

        function submitReturn(form, action) {
            if (action.result !== -1) {
                Ext.Msg.alert('Регистрация', 'Поздравляем! Регистрация прошла успешно');
                panel.down("[name=formInput]").setHidden(false);
                formReg.setHidden(true);
                panel.down("[name=numCard]").setValue(action.result);
                panel.down("[name=password]").setValue(panel.down("[name=regPassword]").getValue());
                controller.onInput();
            }
            else {
                Ext.Msg.alert('Ошибка', 'Регистрация завершилась с ошибкой');
            }
        }
    },

    onInputTextChange: function () {
        let
            valNumCard = this.getView().down("[name=regNumCard]").getValue(),
            valPass = this.getView().down("[name=regPassword]").getValue(),
            valPass2 = this.getView().down("[name=regPassword2]").getValue(),
            btnReg = this.getView().down("[name=btnReg]"),
            messagePasswordNotMatch = this.getView().down("[name=messagePasswordNotMatch]");

        if (this.getView().NeedCard === true) {
            if (valPass.length < 5) {
                messagePasswordNotMatch.setValue("<b><font color=\"red\">Пароль должен быть длиннее 5 символов</font></b>");
            }
            else {
                messagePasswordNotMatch.setValue("");
                if (valPass.length > 0 && valPass2.length > 0) {
                    if (valPass === valPass2) {
                        if (btnReg.isDisabled()) {
                            btnReg.setDisabled(false);
                            messagePasswordNotMatch.setValue("");
                            return;
                        }
                    }
                    else {
                        messagePasswordNotMatch.setValue("<b><font color=\"red\">Пароли не совпадают</font></b>");
                    }
                }
            }
        }
        else
            if (valNumCard.length > 0) {
                if (valPass.length > 0 && valPass2.length > 0) {
                    if (valPass === valPass2) {
                        if (btnReg.isDisabled()) {
                            btnReg.setDisabled(false); //todo добавить сообщения об ошибке
                            return;
                        }
                    }
                }
            }
        if (!btnReg.isDisabled()) {
            btnReg.setDisabled(true);
        }
    },

    onInputTextRegChange: function () {
        const panel = this.getView();
        let
            valName = panel.down("[name=regName]").getValue(),
            valSurname = panel.down("[name=regSurname]").getValue(),
            valPhone = panel.down("[name=regPhone]").getValue(),
            valPass = panel.down("[name=regPassword]").getValue(),
            valPass2 = panel.down("[name=regPassword2]").getValue(),
            btnReg = panel.down("[name=btnReg]");

        if (valName.length > 0 && valSurname.length > 0) {
            if (valPhone.length > 0) {
                if (valPass.length > 0 && valPass2.length > 0) {
                    if (valPass == valPass2) {
                        if (btnReg.isDisabled()) {
                            btnReg.setDisabled(false); //todo добавить сообщения об ошибке
                            return;
                        }
                    }
                }
            }
        }
        if (!btnReg.isDisabled()) {
            btnReg.setDisabled(true);
        }
    },

    onCancelReg: function () {
        const panel = this.getView();
        panel.down("[name=formInput]").setHidden(false);
        panel.down("[name=formReg]").setHidden(true);
    },

    onStopPaste: function(event, inputEl) {
        if(event.type == "paste"){
            event.preventDefault();
            return false;
        }
    }

})
Ext.define('lk.view.main.ProfilController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.profil',

    onSave: function () {
        var
            pnlProfil = this.getView(),
            txtNum = this.lookupReference('txtNum'),
            txtName = this.lookupReference('txtName'),
            txtSurname = this.lookupReference('txtSurname'),
            txtUntuppd = this.lookupReference('txtUntuppd'),
            txtPhone = this.lookupReference('txtPhone'),
            dtBurn = this.lookupReference('txtBurn'),
            data = {};

        data["numcard"] = txtNum.getValue();
        data["nameuser"] = txtName.getValue();
        data["surnameuser"] = txtSurname.getValue();
        data["phone"] = txtPhone.getValue();
        data["burn"] = Ext.Date.format(dtBurn.getValue(), 'Y-m-d');
        data["untuppd"] = txtUntuppd.getValue();

        if (Ext.isEmpty(data["numcard"]) || Ext.isEmpty(data["nameuser"]) || Ext.isEmpty(data["surnameuser"])) {
            Ext.Msg.alert('Ошибка', "Заполните обязательные поля!");
            return;
        }

        Ext.Ajax.request({
            method: 'POST',

            url: './php/classes/Query.php',
            params : {
                'functionname': 'editUser',
                'numcard': data["numcard"],
                'nameuser': data["nameuser"],
                'surnameuser': data["surnameuser"],
                'phone': data["phone"],
                'burn': data["burn"],
                'untuppd': data["untuppd"]
            },

            success: function(res) {
                if (res.responseText.indexOf('Connection Error') > -1) {
                    Ext.Msg.alert('error', res.responseText);
                    console.log(res.responseText);
                }
                else {
                    Ext.Msg.alert('Сообщение', "Сохранение прошло успешно");
                    var main = pnlProfil.up("[name=app-main]");
                    main.UserInfo.name = data["name"];
                    main.UserInfo.surname = data["surname"];
                    main.UserInfo.untuppd = data["untuppd"];
                    main.UserInfo.phone = data["phone"];
                    main.UserInfo.birthday = data["birthday"];

                    if (main.UserInfo.isAdmin === true) {
                        main.down("[name=listusers]").getStore().reload();
                    }
                }
            },
            failure: function() {
                Ext.Msg.alert('error', 'Ошибка сохранения');
            }
        })
    },

    onOut: function () {
        var panel = this.getView();
        var main = panel.up("[name=app-main]");
        main.removeAll();
        main.UserInfo.isReg = false;
        main.UserInfo.isAdmin = null;
        main.UserInfo.isCook = null;
        main.UserInfo.name = null;
        main.UserInfo.surname = null;
        main.UserInfo.untuppd = null;
        main.UserInfo.phone = null;
        main.UserInfo.birthday = null;
        main.UserInfo.numcard = null;

        main.insert(0, {
            xtype: 'panel',
            name: 'pnlLogin',
            title: 'Авторизация',
            items: [{
                xtype: 'registration'
            }]
        })

        Ext.util.Cookies.clear("UserInfo");
    }

})
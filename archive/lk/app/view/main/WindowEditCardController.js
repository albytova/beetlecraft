Ext.define('lk.view.main.WindowEditCardController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.editcard',

    onSaveUser: function (sender, record) {
        var
            txtNumcard = this.lookupReference('txtNumCard'),
            txtNameUser = this.lookupReference('txtNameUser'),
            txtSurnameUser = this.lookupReference('txtSurnameUser'),
            txtPhone = this.lookupReference('txtPhone'),
            dtBurn = this.lookupReference('dtBurn'),
            txtUntuppd = this.lookupReference('txtUntuppd'),
            cmb1C = this.lookupReference('cmb_1c'),
            data = {};

        data["numcard"] = txtNumcard.getValue();
        data["nameuser"] = txtNameUser.getValue();
        data["surnameuser"] = txtSurnameUser.getValue();
        data["phone"] = txtPhone.getValue();
        data["burn"] = Ext.Date.format(dtBurn.getValue(), 'Y-m-d');
        data["untuppd"] = txtUntuppd.getValue();
        data["in1c"] = cmb1C.getValue();

        if (Ext.isEmpty(data["numcard"]) || Ext.isEmpty(data["nameuser"]) || Ext.isEmpty(data["surnameuser"])) {
            Ext.Msg.alert('Ошибка', "Заполните обязательные поля!");
            return;
        }

        var win = this.getView();

        Ext.Ajax.request({
            method: 'POST',

            url: './php/classes/Query.php',
            params : {
                'functionname': win.isAdd? 'addUser' : 'editUser',
                'numcard': data["numcard"],
                'nameuser': data["nameuser"],
                'surnameuser': data["surnameuser"],
                'phone': data["phone"],
                'burn': data["burn"],
                'untuppd': data["untuppd"],
                'in1c': data["in1c"]
            },

            success: function(res) {
                if (res.responseText.indexOf('Connection Error') > -1) {
                    Ext.Msg.alert('error', res.responseText);
                    console.log(res.responseText);
                }
                else {
                    console.log('success');
                    win.close();
                }
            },
            failure: function() {
                Ext.Msg.alert('error', 'Not Ok');
            }
        })
    }
});

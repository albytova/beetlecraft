Ext.define('lk.view.main.zamedlenie.WinCreateDraftController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.wincreatedraft',

    onSaveDraft: function (sender, record) {
        var
            txt_createdraft_num = this.lookupReference('txt_createdraft_num'),
            txt_createdraft_name = this.lookupReference('txt_createdraft_name'),
            txt_createdraft_brew = this.lookupReference('txt_createdraft_brew'),
            txt_createdraft_dist = this.lookupReference('txt_createdraft_dist'),
            txt_createdraft_abv = this.lookupReference('txt_createdraft_abv'),
            txt_createdraft_ibu = this.lookupReference('txt_createdraft_ibu'),
            txt_createdraft_cost300 = this.lookupReference('txt_createdraft_cost300'),
            txt_createdraft_cost500 = this.lookupReference('txt_createdraft_cost500'),
            data = {};

        data["num"] = txt_createdraft_num.getValue();
        data["name"] = txt_createdraft_name.getValue();
        data["brew"] = txt_createdraft_brew.getValue();
        data["dist"] = txt_createdraft_dist.getValue();
        data["abv"] = txt_createdraft_abv.getValue();
        data["ibu"] = txt_createdraft_ibu.getValue();
        data["cost300"] = txt_createdraft_cost300.getValue();
        data["cost500"] = txt_createdraft_cost500.getValue();

        if (Ext.isEmpty(data["name"]) || Ext.isEmpty(data["brew"])) {
            Ext.Msg.alert('Ошибка', "Заполните обязательные поля!");
            return;
        }

        var win = this.getView();
        var isAdd = this.getView().isAdd;

        Ext.Ajax.request({
            method: 'GET',

            url: './php/classes/QueryKitchen.php',
            params : {
                'query': isAdd? 'addDraft' : 'editDraft',
                'id': isAdd? null : this.getView().InitData['id'],
                'num': Ext.isEmpty(data["num"])? '100' : data["num"],
                'name': data["name"],
                'brewery': data["brew"],
                'dist': data["dist"],
                'abv': data["abv"]? data["abv"] : "NULL",
                'ibu': data["ibu"]? data["ibu"] : "NULL",
                'coin_300': data["cost300"]? data["cost300"] : "NULL",
                'coin_500': data["cost500"]? data["cost500"] : "NULL"
            },

            success: function(res) {
                if (res.responseText.indexOf('Connection Error') > -1) {
                    Ext.Msg.alert('error', res.responseText);
                    console.log(res.responseText);
                }
                else {
                    if (isAdd) {
                        win.parentcontroller.sendTaskMessage("Добавить в базу, Кран:"+data["num"]+", "+data["name"]+" ("+data["brew"]+") - "+data["cost300"]+" / "+data["cost500"]);
                    }
                    win.parentcontroller.loadDraft();
                    win.close();
                }
            },
            failure: function() {
                Ext.Msg.alert('error', 'Not Ok');
            }
        });
    }
});

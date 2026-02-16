Ext.define('beetlecraft.view.main.BaseBeer.BeerController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.beer',

    /* Заполнение данных сорта при редактировании */
    setEditBeer: function (data) {
        const cmbBrewery = this.getView().lookupReference("cmb_brewery");
        const txtName = this.getView().lookupReference("txt_name");
        const txtDist = this.getView().lookupReference("txt_dist");
        const txtABV = this.getView().lookupReference("txt_abv");
        const txtIBU = this.getView().lookupReference("txt_ibu");
        const cmbType1 = this.getView().lookupReference("cmb_type_1");
        const cmbType2 = this.getView().lookupReference("cmb_type_2");
        const cmbType3 = this.getView().lookupReference("cmb_type_3");
        const txtUID = this.getView().lookupReference("txt_uid");

        cmbBrewery.setValue(data["ibrewery_id"]);
        txtName.setValue(data["beer_name"]);
        txtDist.setValue(data["beer_dist"]);
        txtABV.setValue(data["beer_abv"]);
        txtIBU.setValue(data["beer_ibu"]);
        cmbType1.setValue(data["beer_type_1"]);
        cmbType2.setValue(data["beer_type_2"]);
        cmbType3.setValue(data["beer_type_3"]);
        txtUID.setValue(data["beer_uid"]);

        this.getView()["BEER_ID"] = data["beer_id"];
    },

    /* Загрузка списка пив из Базы */
    closeWin: function () {

        const me = this;

        me.getView().destroy();
    },

    /* Сохранение сорта */
    saveBeer: function() {

        const me = this;
        const id_beer = me.getView()["BEER_ID"];

        const cmbBrewery = this.getView().lookupReference("cmb_brewery");
        const txtName = this.getView().lookupReference("txt_name");
        const txtDist = this.getView().lookupReference("txt_dist");
        const txtABV = this.getView().lookupReference("txt_abv");
        const txtIBU = this.getView().lookupReference("txt_ibu");
        const cmbType1 = this.getView().lookupReference("cmb_type_1");
        const cmbType2 = this.getView().lookupReference("cmb_type_2");
        const cmbType3 = this.getView().lookupReference("cmb_type_3");
        const txtUID = this.getView().lookupReference("txt_uid");

        if (!cmbBrewery.getValue()) {
            Ext.Msg.alert('Добавление сорта', "Пивоварня не выбрана");
            return;
        }

        if (!txtName.getValue()) {
            Ext.Msg.alert('Добавление сорта', "Название не указано");
            return;
        }

        if (!txtDist.getValue()) {
            Ext.Msg.alert('Добавление сорта', "Описание не указано");
            return;
        }

        if (!cmbType1.getValue()) {
            Ext.Msg.alert('Добавление сорта', "Тип не выбран");
            return;
        }

        if (!txtUID.getValue()) {
            Ext.Msg.alert('Добавление сорта', "Untappd BID не указан");
            return;
        }

        if (!id_beer) {
            const is_exist_beer = this.getView().isHasBeer(txtName.getValue(), cmbBrewery.getRawValue());
            if (is_exist_beer) {
                Ext.Msg.alert('Добавление сорта', "Такой сорт уже существует");
                return;
            }
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Beer.php',
            params : {
                'query' : id_beer? 'editBeer' : 'addBeer',
                'id_beer' : id_beer,
                'brewery' : cmbBrewery.getValue(),
                'name' : txtName.getValue(),
                'dist' : txtDist.getValue(),
                'type_1' : cmbType1.getValue()? cmbType1.getValue() : 'null',
                'type_2' : cmbType2.getValue()? cmbType2.getValue() : 'null',
                'type_3' : cmbType3.getValue()? cmbType3.getValue() : 'null',
                'ABV' : txtABV.getValue()? txtABV.getValue() : 'null',
                'IBU' : txtIBU.getValue()? txtIBU.getValue() : 'null',
                'UID' : txtUID.getValue()
            },
            success: function(result) {

                me.closeWin();

            },
            failure: function(result) {
                console.log("ERROR: " + brewery + "-> " + result.responseText);
            }
        })
    }
});

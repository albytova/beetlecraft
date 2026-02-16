Ext.define('beetlecraft.view.main.LoginController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.login',

    onLoginClick: function() {

        const me = this;

        const cmbUsername = me.lookupReference("cmb_username");
        const cmbShop = me.lookupReference("cmb_shop");
        const txtPassword = me.lookupReference("txt_password");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Profil.php',
            params: {
                "query": "getRightUser",
                'id_shop' : cmbShop.getValue(),
                'id_user': cmbUsername.getValue(),
                'password': txtPassword.getValue()
            },
            success: function (result) {

                if (result.responseText == "no login") {

                    Ext.Msg.alert("Внимание", "Пароль не верен!");
                }
                else {

                    const right_access = result.responseText.trim();

                    localStorage.setItem("LoggedIn", true);
                    localStorage.setItem("ShopID", cmbShop.getValue());
                    localStorage.setItem("UserID", cmbUsername.getValue());
                    localStorage.setItem("UserName", cmbUsername.getRawValue());
                    localStorage.setItem("UserRight", right_access);

                    me.loadShopInfo(  cmbShop.getValue() );

                    me.getView().destroy();

                        Ext.Viewport.add({
                            xtype: 'app-main'
                        });

                }
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })

    },

    onLoginMobileClick: function() {

        const me = this;

        const cmbUsername = me.lookupReference("cmb_username");
        const cmbShop = me.lookupReference("cmb_shop");
        const txtPassword = me.lookupReference("txt_password");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Profil.php',
            params: {
                "query": "getRightUser",
                'id_shop' : cmbShop.getValue(),
                'id_user': cmbUsername.getValue(),
                'password': txtPassword.getValue()
            },
            success: function (result) {

                if (result.responseText == "no login") {

                    Ext.Msg.alert("Внимание", "Пароль не верен!");
                }
                else {

                    const right_access = result.responseText.trim();

                    localStorage.setItem("LoggedIn", true);
                    localStorage.setItem("ShopID", cmbShop.getValue());
                    localStorage.setItem("UserID", cmbUsername.getValue());
                    localStorage.setItem("UserName", cmbUsername.getRawValue());
                    localStorage.setItem("UserRight", right_access);

                    me.loadShopInfo(  cmbShop.getValue() );

                    me.getView().destroy();

                    Ext.Viewport.add({
                        xtype: 'app-mobile'
                    });

                }
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })

    },

    /* Выбор магазина */
    changeShop: function (cmb, value) {

        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Profil.php',
            params: {
                "query": "getUsers",
                'id_shop' : cmb.getValue()
            },
            success: function (result) {

                const cmbUser = me.lookupReference("cmb_username");
                cmbUser.getStore().loadData( JSON.parse(result.responseText) );
                cmbUser.setValue(1);
            },
            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    /* Загрузка информации о магазине */
    loadShopInfo: function (id_shop) {

        const me = this;
        Ext.Ajax.request({
            method: 'GET',
            url: './php/Profil.php',
            params : {
                'query' : 'getInfo',
                'id_shop' : id_shop
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);

                    setProfilData(data);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        })

        function setProfilData (data) {

            Ext.Ajax.request({
                method: 'GET',
                url: './php/Tare.php',
                params : {
                    'query': 'getTare',
                    'id_shop': localStorage.getItem("ShopID")
                },
                success: function(result) {
                    if (result && result.status == 200) {

                        Ext.create('Ext.data.Store', {
                            storeId: 'storeTare',
                            autoLoad: true,
                            fields: [
                                "ID", "name", "formula", "count_unit", "is_draft", {
                                    name: "type",
                                    type: "number"
                                }
                            ],
                            data: JSON.parse(result.responseText)
                        })

                    }
                },
                failure: function(result) {
                    console.log(result);
                }
            })
        }
    }

});

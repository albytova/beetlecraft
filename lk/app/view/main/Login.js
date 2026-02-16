Ext.define('beetlecraft.view.main.Login', {
    extend: 'Ext.panel.Panel',
    xtype: 'login',

    controller: "login",

    items: [
        {
            xtype: 'panel',
            reference: 'form',

            maxWidth: 450,
            bodyPadding: 30,

            items: [

                {
                    xtype: 'combobox',
                    reference: 'cmb_shop',
                    label: 'Магазин',
                    labelWidth: 150,

                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    value: 1,

                    store: {
                        autoLoad: true,
                        storeId: 'storeShops',
                        proxy: {
                            type: 'ajax',
                            method: 'GET',
                            url: './php/Profil.php',
                            extraParams: {
                                'query': 'getShops'
                            }
                        }
                    },

                    listeners: {
                        "change" : "changeShop"
                    }
                },
                {
                    xtype: 'combobox',
                    reference: 'cmb_username',
                    label: 'Пользователь',
                    labelWidth: 150,

                 //   value: 1,

                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',

                    store: {
                        storeId: 'storeUser',
                        fields: ["id", "name"]
                    }
                },
                {
                    xtype: 'textfield',
                    reference: 'txt_password',
                    inputType: 'password',
                    label: 'Пароль',
                    labelWidth: 150,
                    allowBlank: false
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    align: 'stretch',

                    items: [
                        {
                            xtype: 'button',
                            text: 'Войти в мобильную версию',
                            flex: 1,
                            style: {
                                'color' : 'lightgrey'
                            },
                            margin: '0 5 0 0',
                            handler: 'onLoginMobileClick'
                        },
                        {
                            xtype: 'button',
                            text: 'Войти',
                            width: 150,
                            style: {
                                'font-weight' : 'bold'
                            },
                            handler: 'onLoginClick'
                        }
                    ]
                }

            ]
        }
    ],
    //
    // listeners: {
    //
    //     "onActivate": "activate"
    // }

});

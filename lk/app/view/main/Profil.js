Ext.define('beetlecraft.view.main.Profil', {
    extend: 'Ext.panel.Panel',
    xtype: 'profil',

    requires: [
        'Ext.panel.Panel'
    ],

    controller: "profil",

    flex: 1,

    padding: "30px",

    items: [
        {
            xtype: 'textfield',
            reference: 'txt_shop',
            label: "Организация",
            readOnly: true,
            width: "300px"
        },
        {
            xtype: 'textfield',
            reference: 'txt_username',
            label: "Пользователь",
            width: "300px"
        },
        {
            xtype: 'button',
            text: 'Выйти из профиля',
            handler: "onOutProfil"
        }
    ],

    listeners: {
        activate : "onActivate"
    }

});

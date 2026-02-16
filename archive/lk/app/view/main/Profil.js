Ext.define('lk.view.main.Profil', {
    extend: 'Ext.panel.Panel',
    xtype: 'profil',
    reference: 'profil',
    controller: 'profil',

    title: 'Профиль',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },


    flex: 1,
    autoScroll: true,

    items: [
        {
            xtype: 'label',
            html: "<h1>Профиль</h1>"
        },
        {
            xtype: 'textfield',
            name: 'txtNum',
            reference: 'txtNum',
            labelAlign: 'left',
            allowBlank: true,
            fieldLabel: 'Дисконтная карта',
            labelWidth: 110,
            editable: false,
            disable: true
        },
        {
            xtype: 'textfield',
            name: 'txtName',
            reference: 'txtName',
            labelAlign: 'left',
            fieldLabel: 'Имя',
            allowBlank: true,
            labelWidth: 110
        },
        {
            xtype: 'textfield',
            name: 'txtSurname',
            reference: 'txtSurname',
            labelAlign: 'left',
            fieldLabel: 'Фамилия',
            allowBlank: true,
            labelWidth: 110
        },
        {
            xtype: 'textfield',
            name: 'txtUntuppd',
            reference: 'txtUntuppd',
            labelAlign: 'left',
            fieldLabel: 'Untuppd',
            labelWidth: 110
        },
        {
            xtype: 'textfield',
            name: 'txtPhone',
            reference: 'txtPhone',
            labelAlign: 'left',
            fieldLabel: 'Телефон',
            labelWidth: 110
        },
        {
            xtype: 'datefield',
            name: 'txtBurn',
            reference: 'txtBurn',
            labelAlign: 'left',
            fieldLabel: 'Дата рождения',
            labelWidth: 110
        },
        {
            xtype: 'checkbox',
            name: 'chkAdmin',
            reference: 'chkAdmin',
            boxLabel  : 'Администратор',
            inputValue: 1,
            readOnly: true,
            hidden: true
        },
        {
            xtype: 'checkbox',
            name: 'chkCook',
            reference: 'chkCook',
            boxLabel  : 'Повар',
            inputValue: 1,
            readOnly: true,
            hidden: true
        },
        {
            xtype: 'checkbox',
            name: 'chkSmm',
            reference: 'chkSmm',
            boxLabel  : 'SMM',
            inputValue: 1,
            readOnly: true,
            hidden: true
        },
        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'button',
                    text: 'Сохранить',
                    handler: 'onSave'
                },
                {
                    xtype: 'button',
                    text: 'Выйти из профиля',
                    handler: 'onOut',
                    margin: '0 0 0 10'
                }
            ]
        }
    ],

    initComponent: function() {
        var panel = this;
        panel.callParent(arguments);

        var main = this.up("[name=app-main]");
        panel.down("[name=txtNum]").setValue(main.UserInfo.numcard);
        panel.down("[name=txtName]").setValue(main.UserInfo.name);
        panel.down("[name=txtSurname]").setValue(main.UserInfo.surname);
        panel.down("[name=txtUntuppd]").setValue(main.UserInfo.untuppd);
        panel.down("[name=txtPhone]").setValue(main.UserInfo.phone);
        panel.down("[name=txtBurn]").setValue(main.UserInfo.birthday);
        if (main.UserInfo.isAdmin) {
            panel.down("[name=chkAdmin]").setValue(main.UserInfo.isAdmin);
            panel.down("[name=chkAdmin]").setHidden(false);
        }
        if (main.UserInfo.isCook) {
            panel.down("[name=chkCook]").setValue(main.UserInfo.isCook);
            panel.down("[name=chkCook]").setHidden(false);
        }
        if (main.UserInfo.isSmm) {
            panel.down("[name=chkSmm]").setValue(main.UserInfo.isSmm);
            panel.down("[name=chkSmm]").setHidden(false);
        }
    }
})
Ext.define('lk.view.main.WindowEditCard', {
    extend: 'Ext.window.Window',
    xtype: 'wincard',

    requires: [
        'lk.view.main.WindowEditCardController'
    ],

    controller: 'editcard',

    title: 'Создание дисконтной карты',
    height: 410,
    width: 300,
    layout: {
        type: 'vbox',
    },
    bodyPadding: 10,

    isAdd: true,

    InitData: {
        numcard: null,
        nameuser: null,
        surnameuser: null,
        phone: null,
        dt_burn: null,
        untuppd: null,
        in1c: null
    },

    items: [
        {
            xtype: 'textfield',
            name: 'numcard',
            itemId: 'numcard',
            reference: 'txtNumCard',
            fieldLabel: 'Номер карты',
            allowBlank: true,
            maskRe: /[0-9]/,
            validator: function(v) {
                return /^[0-9]*$/.test(v)? true : 'только цифры';
            }
        },
        {
            xtype: 'textfield',
            name: 'nameUser',
            reference: 'txtNameUser',
            fieldLabel: 'Имя',
            allowBlank: true
        },
        {
            xtype: 'textfield',
            name: 'surnameUser',
            reference: 'txtSurnameUser',
            fieldLabel: 'Фамилия',
            allowBlank: true
        },
        {
            xtype: 'textfield',
            name: 'phone',
            reference: 'txtPhone',
            fieldLabel: 'Телефон'
        },
        {
            xtype: 'datefield',
            name: 'dt_burn',
            reference: 'dtBurn',
            fieldLabel: 'Дата рождения'
        },
        {
            xtype: 'textfield',
            name: 'untuppd',
            reference: 'txtUntuppd',
            fieldLabel: 'Untuppd',
            disabled: true
        },
        {
            xtype: 'combobox',
            name: 'cmb_1c',
            reference: 'cmb_1c',
            fieldLabel: 'Внесён в 1С',
            store: {
                fields: ['id', 'name'],
                data: [
                    {id: 1, name: 'Да'},
                    {id: 0, name: 'Нет'}
                ]
            },
            displayField: 'name',
            valueField: 'id',
        }
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                xtype: 'button',
                name: 'btnSave',
                dock: 'bottom',
                text: 'Сохранить',
                handler: 'onSaveUser'
            },
            {
                xtype: 'button',
                dock: 'bottom',
                text: 'Закрыть',
                handler: function () {
                    this.up('window').close();
                }
            }
        ]
    }],

    initComponent: function() {
        var win = this;
        win.callParent(arguments);


        if (!win.isAdd && win.InitData) {
            win.down('[name=numcard]').setValue(win.InitData["numcard"]);
            win.down('[name=nameUser]').setValue(win.InitData["nameuser"]);
            win.down('[name=surnameUser]').setValue(win.InitData["surnameuser"]);
            win.down('[name=phone]').setValue(win.InitData["phone"]);
            win.down('[name=dt_burn]').setValue(win.InitData["dt_burn"]);
            win.down('[name=untuppd]').setValue(win.InitData["untuppd"]);
            win.down('[name=cmb_1c]').setValue(win.InitData["in1c"]);
            console.log(win.InitData["in1c"]);
        }

        if (win.isAdd) {
            win.down('[name=btnSave]').setText("Добавить");
        }
        else {
            if (win.InitData["is_reg"])
                win.down('[name=untuppd]').setDisabled(false);
        }

    }
})
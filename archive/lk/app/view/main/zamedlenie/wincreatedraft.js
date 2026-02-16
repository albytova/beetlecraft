Ext.define('lk.view.main.zamedlenie.WinCreateDraft', {
    extend: 'Ext.window.Window',
    xtype: 'wincreatedraft',

    requires: [
        'lk.view.main.zamedlenie.WinCreateDraftController'
    ],

    controller: 'wincreatedraft',

    title: 'Добавление пивной кеги',
    height: 450,
    width: 300,
    layout: {
        type: 'vbox'
    },
    bodyPadding: 10,

    isAdd: true,

    items: [
        {
            xtype: 'textfield',
            name: 'txt_createdraft_num',
            itemId: 'txt_createdraft_num',
            reference: 'txt_createdraft_num',
            fieldLabel: 'Номер крана',
            maskRe: /[0-9]/,
            validator: function(v) {
                return /^[0-9]*$/.test(v)? true : 'только цифры';
            }
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_name',
            itemId: 'txt_createdraft_name',
            reference: 'txt_createdraft_name',
            fieldLabel: 'Название',
            allowBlank: true,
            emptyText: "обязательное поле"
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_brew',
            itemId: 'txt_createdraft_brew',
            reference: 'txt_createdraft_brew',
            fieldLabel: 'Пивоварня',
            allowBlank: true,
            emptyText: "обязательное поле"
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_dist',
            itemId: 'txt_createdraft_dist',
            reference: 'txt_createdraft_dist',
            fieldLabel: 'Описание'
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_abv',
            itemId: 'txt_createdraft_abv',
            reference: 'txt_createdraft_abv',
            fieldLabel: 'ABV',
            maskRe: /[0-9.0-9]/,
            validator: function(v) {
                return /^[0-9.0-9]*$/.test(v)? true : 'только цифры и точка';
            }
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_ibu',
            itemId: 'txt_createdraft_ibu',
            reference: 'txt_createdraft_ibu',
            fieldLabel: 'IBU',
            maskRe: /[0-9]/,
            validator: function(v) {
                return /^[0-9]*$/.test(v)? true : 'только цифры';
            }
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_cost300',
            itemId: 'txt_createdraft_cost300',
            reference: 'txt_createdraft_cost300',
            fieldLabel: 'Цена за 300мл',
            maskRe: /[0-9]/,
            validator: function(v) {
                return /^[0-9]*$/.test(v)? true : 'только цифры';
            }
        },
        {
            xtype: 'textfield',
            name: 'txt_createdraft_cost500',
            itemId: 'txt_createdraft_cost500',
            reference: 'txt_createdraft_cost500',
            fieldLabel: 'Цена за 500мл',
            maskRe: /[0-9]/,
            validator: function(v) {
                return /^[0-9]*$/.test(v)? true : 'только цифры';
            }
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
                handler: 'onSaveDraft'
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
            win.down('[name=txt_createdraft_num]').setValue(win.InitData["num"]);
            win.down('[name=txt_createdraft_name]').setValue(win.InitData["name"]);
            win.down('[name=txt_createdraft_brew]').setValue(win.InitData["brew"]);
            win.down('[name=txt_createdraft_dist]').setValue(win.InitData["dist"]);
            win.down('[name=txt_createdraft_abv]').setValue(win.InitData["abv"]);
            win.down('[name=txt_createdraft_ibu]').setValue(win.InitData["ibu"]);
            win.down('[name=txt_createdraft_cost300]').setValue(win.InitData["cost300"]);
            win.down('[name=txt_createdraft_cost500]').setValue(win.InitData["cost500"]);

            win.down('[name=txt_createdraft_num]').setDisabled(true);
        }
    }
})
Ext.define('lk.view.main.ListUsers', {
    extend: 'Ext.grid.Panel',
    xtype: 'listusers',
    reference: 'listusers',
    controller: 'listusers',
    name: 'listusers',
    requires: [
        'lk.store.Users'
    ],

    title: 'Карты',

    store: {
        type: 'users'
    },

    tbar: [
        {
            text: 'Добавить',
            handler: 'onInput'
        },
        {
            text: 'Изменить',
            handler: 'onEdit'
        },
        {
            xtype: 'button',
            text: 'Обновить',
            handler: 'onUpdate'
        }
    ],

    plugins: {
        rowediting: {
            clicksToMoveEditor: 2,
            autoCancel: true,
            saveBtnText: "Сохранить",
            cancelBtnText: "Отменить"
        }
    },

    columns: [
        {
            header: '<div>Номер</div><div>карты</div>',
            dataIndex: 'num'
        },
        {
            text: 'Имя',
            dataIndex: 'name',
            editor: {
                allowBlank: false
            }
        },
        {
            text: 'Фамилия',
            dataIndex: 'surname',
            editor: {
                allowBlank: false
            }
        },
        {
            text: 'Телефон',
            dataIndex: 'phone',
            editor: {
                allowBlank: false
            }
        },
        {
            xtype: 'datecolumn',
            text: '<div>Дата</div><div>рождения</div>',
            dataIndex: 'birthday',
            format: 'd.m.Y',
            editor: {
                xtype: 'datefield',
                allowBlank: false,
                format: 'd.m.Y',
                minValue: '01/01/1950',
                maxValue: Ext.Date.format(new Date(), 'd.m.Y')
            }
        },
        {
            text: 'untuppd',
            dataIndex: 'untuppd',
            editor: {
                allowBlank: true
            }
        },
        {
            xtype: 'booleancolumn',
            header:'<div>Зареги-</div><div>стрирован</div><div>на сайте?</div>',
            dataIndex: 'is_reg',
            trueText: 'Да',
            falseText: ''
        },
        {
            header: '<div>Внесён</div><div>в 1С?</div>',
            dataIndex: 'in1c',
            renderer: function(v) {
                if (v === 1)
                    return 'Да';
                return '';
            }
        }
    ]


});

Ext.define('beetlecraft.view.main.Purshace.Tare', {
    extend: 'Ext.panel.Panel',
    xtype: 'tare',

    requires: [
        'Ext.grid.Grid',
        'Ext.panel.Panel'
    ],

    controller: "tare",

    tbar: [
        {
            xtype: 'button',
            iconCls: "fas fa-plus",
            tooltip: "Добавить тару",
            handler: 'onAddTare'
        },
        {
            xtype: 'button',
            iconCls: "fas fa-minus",
            tooltip: "Удалить тару",
            handler: 'onDeleteTare'
        }
    ],

    items: [
        {
            xtype: 'container',
            layout: 'vbox',
            items: [
                {
                    xtype: 'grid',

                    name: 'grid_tare',
                    reference: 'grid_tare',

                    flex: 2,
                    width: '100%',

                    plugins: {
                        rowedit: true
                    },

                    columns: [{
                        text: 'Название',
                        dataIndex: 'name',
                        editable: true,
                        editor: {
                            xtype: 'textfield'
                        },
                        flex: 1
                    },{
                        text: 'Тип',
                        dataIndex: 'type',
                        flex: 1,
                        editable: true,
                        editor: {
                            xtype: 'combobox',
                            forceSelection: true,
                            editable: false,
                            triggerAction: 'all',
                            allowBlank: false,
                            valueField: 'value',
                            displayField: 'descr',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['descr', 'value'],
                                data: [{
                                    descr: 'Кег',
                                    value: 0
                                }, {
                                    descr: 'Бутылка',
                                    value: 1
                                }, {
                                    descr: 'Порция Розлива',
                                    value: 2
                                }]
                            })

                        },

                        renderer: function(value, metaData, record) {
                            switch (value) {
                                case 0:
                                    return "Кег";
                                case 1:
                                    return "Бутылка";
                                case 2:
                                    return "Порция Розлива";
                                default:
                                    return "";
                            }
                        }
                    },{
                        text: 'Литров',
                        dataIndex: 'count_unit',
                        flex: 1,
                        editable: true,
                        editor: {
                            xtype: 'textfield'
                        }
                    },{
                        text: 'Формула',
                        dataIndex: 'formula',
                        flex: 1,
                        editable: true,
                        editor: {
                            xtype: 'textfield'
                        }
                    }],

                    listeners: {
                        edit: "onEdit"
                    }
                },
                {
                    xtype: 'panel',
                    bodyPadding: 20,
                    flex: 2,
                    items: [
                        {
                            html: "<b><u>Типы:</u></b> <br>~ Кег - для формирования закупок<br>~ Бутылка<br>~ Порция Розлива - пластиковая бутылка или стакан для формирования продажи",
                        },
                        {
                            html: "<br><br><b><u>Литров:</u></b> <br>Для кег: Сколько литров в кеге с вычетом потерь<br>Для бутылок - не надо<br>Для порции розлива - объём в литрах, ля суммирования продаж",
                        },
                        {
                            html: "<br><br><b><u>Формула:</u></b> <br>:x - используется для кег и бутылок, т.е. того что используется в закупках<br>y - использутся только порции розлива",
                        }
                    ]
                }
            ]
        }

    ],

    listeners: {
        activate: "createStoreTare"
    }



});
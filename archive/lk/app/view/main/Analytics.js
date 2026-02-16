Ext.define('lk.view.main.Analytics', {
    extend: 'Ext.panel.Panel',
    xtype: 'analytics',
    reference: 'analytics',
    controller: 'analytics',
    name: 'analytics',

    title: 'Кухня',

    flex: 1,
    autoScroll: true,

    items: [
        {
            xtype: 'panel',
            layout: {
                type: 'vbox'
            },
            items: [
                {
                    xtype: 'combobox',
                    label: 'Точка продаж',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'name',
                    margin: '5 0 5 0',
                    forceSelection: true,
                    width: 200,
                    store: [
                        { name: 'BeetleCraft.Пенза' },
                        { name: 'Замедление времени' }
                    ],
                    value: 'BeetleCraft.Пенза'
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    width: 200,
                    items: [
                        {
                            xtype: 'label',
                            text: 'Выберите файл',
                            padding: '10 0 10 0'
                        },
                        {
                            xtype: 'button',
                            text: 'Загрузить',
                            margin: 5
                        }
                    ]
                }

                ]
        }
    ]
})
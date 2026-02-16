Ext.define('lk.view.main.Smm', {
    extend: 'Ext.panel.Panel',
    xtype: 'smm',
    reference: 'smm',
    controller: 'smm',
    name: 'smm',

    title: 'SMM',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    flex: 1,
    autoScroll: true,
    scrollable: true,

    InitData: { //Данных которые хранятся в классе (грузятся из гугл таблицы)
        isInit: false,
        draft: {},
        bottle: {}
    },

    items: [
        {
            xtype: 'label',
            html: "<h1>SMM</h1>"
        },
        {
            xtype: 'panel',
            layout: {
                type: 'hbox'
            },
            margin: '0 0 10 0',
            autoScroll: true,
            items: [
                {
                    xtype: 'button',
                    text: 'Загрузить',
                    margin: 5,
                    style: {
                        background: 'darkred',
                        borderRadius: '5px'
                    },
                    handler: 'onLoad'
                },
                {
                    xtype: 'label',
                    html: '<font size="4">Опубликовать:</font>',
                    padding: '10 0 0 0'
                },
                {
                    xtype: 'button',
                    text: 'Сегодня',
                    margin: 5,
                    style: {
                        background: '#0ab71f',
                        borderRadius: '5px'
                    },
                    handler: 'onToday'
                }
            ]
        },
        {
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1,
            autoScroll: true,
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    maring: '0 0 15 0',
                    padding: 5,
                    style: {
                      background: '#fffffa'
                    },
                    items: [
                        {
                            xtype: 'container',
                            width: 100,
                            layout: {
                                type: 'vbox'
                            },
                            items: [
                                {
                                    xtype: 'label',
                                    html: '<h3>Розлив<br>BeetleCraft</h3>'
                                }
                            ]
                        },
                        {
                            xtype: 'label',
                            id: 'areaDraftBeetle',
                            name: 'areaDraftBeetle',
                            flex: 1,
                            margin: '0 0 0 5',
                            html: ''
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    maring: '0 0 15 0',
                    padding: 5,
                    style: {
                        background: '#eae9e9'
                    },
                    items: [
                        {
                            xtype: 'container',
                            width: 100,
                            layout: {
                                type: 'vbox'
                            },
                            items: [
                                {
                                    xtype: 'label',
                                    html: '<h3>Стекло<br>BeetleCraft</h3>'
                                }
                            ]
                        },
                        {
                            xtype: 'label',
                            name: 'areaBottleBeetle',
                            flex: 1,
                            margin: '0 0 0 5'
                        }
                    ]
                }
            ]
        }
    ]//,
    //
    // initComponent: function() {
    //     var panel = this;
    //     panel.callParent(arguments);
    //
    //     if (!panel.InitData.isInit)
    //         panel.getController().loadInitData();
    // }
});


//https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=594664287&single=true&output=csv
Ext.define('lk.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',
    name: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'lk.view.main.MainController',
        'lk.view.main.MainModel',
        'lk.view.main.Profil',
        'lk.view.main.Kitchen',
        'lk.view.main.BeetleProf',
        'lk.view.main.Admin',
        'lk.view.main.ListBeer',
        'lk.view.main.Registration',
        'lk.view.main.Smm',
        'lk.view.main.Analytics'
    ],

    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    UserInfo: { //хранение информации о пользователе
        isReg: false,
        isAdmin: false,
        isCook: false,
        isSmm: false,
        name: null,
        surname: null,
        numcard: null
    },

    header: {

        layout: {
            align: 'stretchmax'
        },
        title: {
            flex: 0
        },
        iconCls: 'fa-th-list',
        style: {
          backgroundColor: "#404040"
        },
        items: [
            {
                xtype: 'button',
                text: 'Скрыть',
                style: {
                    backgroundColor: 'darkred',
                    border: 0
                },
                handler: "onCollapseHeader"
            }
        ]
    },

    tabBar: {
        bodyPadding: 0,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'left',
            width: 70
        },
        wide: {
            headerPosition: 'left',
            width: 30
        }
    },

    defaults: {
        bodyPadding: 20,
        tabConfig: {
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center'
                }
            }
        }
    },

    initComponent: function() {
        const main = this;
        main.callParent(arguments);
console.log("initComponent");
        // if (Ext.util.Cookies.get("UserInfo") && JSON.parse(Ext.util.Cookies.get("UserInfo"))) {
        //     main.UserInfo = JSON.parse(Ext.util.Cookies.get("UserInfo"));
        //
        //     if (main.UserInfo.isReg) {
                main.insert(0, {
                    xtype: "profil",
                    title: 'Профиль'
                });
        //        if (main.UserInfo.isAdmin) {
                    main.insert(1, Ext.create({
                        xtype: 'admin',
                        title: 'Админ'
                    }));
                    main.insert(2, Ext.create({
                        xtype: 'beetleprof',
                        title: 'Закупки'
                    }));
                    // main.insert(3, Ext.create({
                    //     xtype: 'listbeer',
                    //     title: 'Пиво'
                    // }));
                    // main.insert(4, Ext.create({
                    //     xtype: 'analytics',
                    //     title: 'Аналитика'
                    // }))
                // }
                // if (main.UserInfo.isCook) {
                //     main.insert(1, Ext.create({
                //         xtype: 'kitchen',
                //         title: 'Наличие'
                //     }));
                // }
                //if (main.UserInfo.isSmm) {
                    main.insert(1, Ext.create({
                        xtype: 'smm',
                        title: 'SMM'
                    }));
                //}
        //     }
        //     else {
        //         main.insert(0, {
        //             xtype: 'registration',
        //             name: 'pnlLogin',
        //             title: 'Авторизация'
        //         })
        //     }
        // }
        // else {
        //     main.insert(0, {
        //         xtype: 'registration',
        //         name: 'pnlLogin',
        //         title: 'Авторизация'
        //     });
        // }
    }
});

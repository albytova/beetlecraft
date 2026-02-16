/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'beetlecraft.Application',

    name: 'beetlecraft',
    reference: 'beetlecraft',

    requires: [
        // This will automatically load all classes in the beetlecraft namespace
        // so that application classes do not need to require each other.
        'beetlecraft.*'
    ],

    views: [
        'beetlecraft.view.main.Login'//,
        //'beetlecraft.view.main.Main'
    ],

    //mainView: localStorage.getItem("LoggedIn")? 'beetlecraft.view.main.Main' : 'beetlecraft.view.main.Login'
    mainView: 'beetlecraft.view.main.Login'
});

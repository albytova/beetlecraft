Ext.define('beetlecraft.view.main.ProfilController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.profil',

    onActivate: function ( sender, eOpts ) {

        this.getView().lookupReference("txt_shop").setValue( localStorage.getItem("ProfilName") );
        this.getView().lookupReference("txt_username").setValue( localStorage.getItem("UserName") );
    },

    onOutProfil: function () {

        Ext.Viewport.removeAt(0);

        Ext.Viewport.add({
            xtype: 'login'
        });
    }
});

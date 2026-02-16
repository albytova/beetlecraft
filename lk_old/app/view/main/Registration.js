Ext.define('lk.view.main.Registration', {
    extend: 'Ext.panel.Panel',
    xtype: 'registration',
    reference: 'registration',
    controller: 'registration',

    title: 'Авторизация',

    layout: {
      type: 'vbox'
    },

    items: [
        {
            xtype: 'form',
            name: 'formInput',
            layout: 'vbox',
            items: [
                {
                    xtype: 'label',
                    html: '<h1>Войти в профиль</h1>'
                },
                {
                    xtype: 'textfield',
                    name: 'numCard',
                    labelAlign: 'top',
                    fieldLabel: 'Номер дисконтной карты'
                },
                {
                    xtype: 'textfield',
                    name: 'password',
                    labelAlign: 'top',
                    fieldLabel: 'Пароль',
                    inputType: 'password'
                },
                {
                    xtype: 'button',
                    text: 'Войти',
                    handler: 'onInput'
                },
                {
                    xtype: 'panel',
                    layout: 'vbox',
                    margin: '30 0 10 0',
                    items: [
                        {
                            xtype: 'label',
                            html: 'Если вы не зарегистрированы, жмите сюда'
                        },
                        {
                            xtype: 'button',
                            text: 'Регистрация',
                            handler: 'onReg'
                        }
                    ]
                }
            ]
        },

        {
            xtype: 'form',
            name: 'formReg',
            layout: 'vbox',
            hidden: true,
            items: [
                        {
                            xtype: 'textfield',
                            name: 'regNumCard',
                            labelAlign: 'top',
                            fieldLabel: 'Номер дисконтной карты',
                            allowBlank: false,
                            listeners: {
                                change: 'onInputTextChange'
                            }
                        },
                        {
                            xtype: 'container',
                            name: 'cntRegCard',
                            layout: 'vbox',
                            items: [
                              {
                                  xtype: 'textfield',
                                  name: 'regName',
                                  labelAlign: 'top',
                                  fieldLabel: 'Имя',
                                  allowBlank: false,
                                  listeners: {
                                      change: 'onInputTextRegChange'
                                  }
                              },
                              {
                                  xtype: 'textfield',
                                  name: 'regSurname',
                                  labelAlign: 'top',
                                  fieldLabel: 'Фамилия',
                                  allowBlank: false,
                                  listeners: {
                                      change: 'onInputTextRegChange'
                                  }
                              },
                              {
                                  xtype: 'datefield',
                                  name: 'regDateBurn',
                                  labelAlign: 'top',
                                  fieldLabel: 'Дата рождения',
                                  format: 'd.m.Y',
                                  minValue: '01/01/1950',
                                  maxValue: '01/01/2003'
                              }
                          ]
                        },
                        {
                            xtype: 'textfield',
                            name: 'regPhone',
                            labelAlign: 'top',
                            fieldLabel: 'Телефон',
                            allowBlank: false,
                            inputType: 'phone',
                            listeners: {
                                change: 'onInputTextRegChange'
                            }
                        },
                        {
                            xtype: 'textfield',
                            name: 'regUntappd',
                            labelAlign: 'top',
                            maskRe: /[a-zA-Z0-9\-_]/,
                            enableKeyEvents: true,
                            fieldLabel: 'Имя пользователя Untuppd'
                        },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: {
                                type: 'vbox'
                            },
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'regPassword',
                                    labelAlign: 'top',
                                    inputType: 'password',
                                    fieldLabel: 'Пароль',
                                    allowBlank: false,
                                    enableKeyEvents: false,
                                    maskRe: /[a-zA-Z0-9]/,
                                    listeners: {
                                        change: 'onInputTextChange',
                                        paste: {
                                            element: 'inputEl',
                                            fn: 'onStopPaste'
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'regPassword2',
                                    labelAlign: 'top',
                                    maskRe: /[a-zA-Z0-9]/,
                                    inputType: 'password',
                                    fieldLabel: 'Повторите пароль',
                                    allowBlank: false,
                                    enableKeyEvents: false,
                                    listeners: {
                                        change: 'onInputTextChange',
                                        paste: {
                                            element: 'inputEl',
                                            fn: 'onStopPaste'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'displayfield',
                            name: 'messagePasswordNotMatch',
                            layout: {
                                type: 'fit'
                            },
                            margin: '65 0 0 20',
                            value: ''
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'button',
                            name: 'btnReg',
                            text: 'Зарегистрироваться',
                            disabled: true,
                            handler: 'onSendReg'
                        },
                        {
                            xtype: 'button',
                            name: 'btnCancel',
                            text: 'Отмена',
                            handler: 'onCancelReg',
                            margin: '0 0 0 5'
                        }
                    ]
                }
            ]
        }

    ]

})

//https://api.untappd.com/v4/user/info/enotttikk?client_id=249F2A5D9807CA76D4E06B5BBE8F60124EACDDCB&client_secret=F14F94983A2AED236905DAA21821D47A8154EDEF
'use strict'

module.exports = {
    header:{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    },
    Api:{
        base:'http://rap.taobao.org/mockjs/9013/',//主入口
        creations:'manlist?',//主页视频列表地址
        comment:'detail/comment?',//评论信息地址
        sbumitComment:'detail/submitComment?',//提交评论地址
        verificationCode:'login/verificationCode?',//获取验证码接口
        login:'login/phonelogin?'//用户登录接口
    }
}
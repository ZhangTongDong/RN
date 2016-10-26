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
        comment:'detail/comment?'//评论信息地址
    }
}
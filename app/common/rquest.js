'use strict'

var queryString = require('query-string');//对参数进行拼接的模块
var _ = require('lodash');
var config = require('./config');//储存路径的模块路径

var Mockjs = require('mockjs');//处理测试数据，线上需要注释掉！！！！！！！！！

var request = {}

request.get = function(url,params){
    if(params){
        url += queryString.stringify(params)
    }

    return fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
            return Mockjs.mock(responseJson)  //线上需要修改，直接返回responseJson
        })
        .catch((error) => {
            console.error(error);
        });
}


request.post = function(url,body){
     var options = _.extend(config.header,{
         body: JSON.stringify(body)
     })
    return  fetch(url,options)
        .then((response) => response.json())
        .then((response) => {return Mockjs.mock(response)})
}

module.exports = request
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    TextInput,
    Alert,
    AsyncStorage,
    TouchableOpacity
} from 'react-native';

var Request = require('../common/rquest');//封装ajax的模块

var Button = require('react-native-button').default//按钮组件

var {CountDownText} = require('react-native-sk-countdown');//倒计时组件

var config = require('../common/config.js');//存放路径的模块

var Login = React.createClass({
    getInitialState(){
        return {
            phoneNumber:'',//手机号
            isverificationCode:false,//是否已经获取验证码
            verificationCode:'',//用户输入的验证码
            conting:true//判断是否正在获取验证码
        }
    },
    _obtainNumber(){//获取验证码
        if(!this.state.phoneNumber){
            return Alert.alert('手机不能为空',null,[{text:'确认'}])
        }
        var phoneNumber = this.state.phoneNumber
        var _this = this
        Request.post(config.Api.base+config.Api.verificationCode,phoneNumber)
            .then((data) => {
                if (data.success) {
                    console.log(this.state.conting)
                    _this.setState({
                        isverificationCode: true,
                        conting:true
                    })
                }
             })
            .catch((err) => {
                return Alert.alert('请检查网络是否良好',null,[{text:'确认'}])
            })
    },
    _login(){//手机登录
        var phoneNumber = this.state.phoneNumber
        var verificationCode = this.state.verificationCode
        if(!phoneNumber || !verificationCode){
            return Alert.alert('手机号或者验证码不能为空',null,[{text:'确认'}])
        }

        var userdata = {//用户手机号和验证码
            phoneNumber:phoneNumber,
            verificationCode:verificationCode
        }

        Request.post(config.Api.base+config.Api.login,userdata)
            .then((data) => {
                if (data.success) {
                    Alert.alert('登录成功',null,[{text:'确认'}])
                    userdata = JSON.stringify(userdata)
                    AsyncStorage.setItem('user',userdata)
                        .catch((err) => {
                            console.log(err)
                        })
                    this.props.login()
                }else {
                    Alert.alert('手机号或者验证码输入错误',null,[{text:'确认'}])
                }
            })
            .catch((err) => {
                return Alert.alert('请检查网络是否良好',null,[{text:'确认'}])
            })

    },
    render(){
        return(
            <View style={styles.container}>
               <Text style={styles.title}>
                   快速登录
               </Text>

                <TextInput
                    style={{height:40,color:'#999',fontSize:16,borderWidth:1,borderColor:'#CCC',borderRadius:4,marginTop:10}}
                    autoFocus={true}
                    keyboardType='numeric'
                    textAlignVertical ="top"
                    underlineColorAndroid='transparent'
                    placeholder="输入手机号"
                    placeholderTextColor="#ccc"
                    onChangeText={(text) => this.setState({phoneNumber:text})}
                    value={this.state.phoneNumber}
                />

                {
                    this.state.isverificationCode//是否已经获取验证码
                    ? <View style={{flexDirection:'row'}}>
                        <TextInput
                            style={{flex:1,height:40,color:'#999',fontSize:16,borderWidth:1,borderColor:'#CCC',borderRadius:4,marginTop:10,marginRight:10}}
                            autoFocus={true}
                            keyboardType='numeric'
                            textAlignVertical ="top"
                            underlineColorAndroid='transparent'
                            placeholder="输入验证码"
                            placeholderTextColor="#ccc"
                            onChangeText={(text) => this.setState({verificationCode:text})}
                            value={this.state.verificationCode}
                        />

                        {
                            this.state.conting//是否正在获取验证码
                            ? <CountDownText
                                style={{width:100,height:40,marginTop:10,textAlign:'center',borderWidth:1,borderColor:'#ee735c',color:'#ee735c',borderRadius:2,textAlignVertical:'center'}}
                                countType='seconds' // 计时类型：seconds / date
                                auto={true} // 自动开始
                                afterEnd={() => {this.setState({conting:false})}} // 结束回调
                                timeLeft={60} // 正向计时 时间起点为0秒
                                step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                startText='获取验证码' // 开始的文本
                                endText='获取验证码' // 结束的文本
                                intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                            />
                            :<TouchableOpacity
                                onPress={this._obtainNumber}
                                style={{width:100,height:40,marginTop:10,borderWidth:1,borderColor:'#ee735c',borderRadius:2}}>
                                <Text style={{flex:1,textAlign:'center',textAlignVertical:'center',color:'#ee735c'}}>
                                    重新获取
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                    :null
                }

                {
                    this.state.isverificationCode//是否已经获取验证码
                    ?<Button style={{padding:10,color:'#fff',backgroundColor:'#ee735c',borderRadius:4,marginTop:10}}
                        onPress={this._login}>登录</Button>
                    :<Button style={{padding:10,color:'#fff',backgroundColor:'#ee735c',borderRadius:4,marginTop:10}}
                        onPress={this._obtainNumber}>获取验证码</Button>
                }
            </View>
        );
    }
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        padding:10
    },
    title:{
        fontSize:16,
        fontWeight:'600',
        textAlign:'center',
        marginTop:10
    }
});

module.exports = Login
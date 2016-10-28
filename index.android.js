/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  Navigator,
  View,
  AsyncStorage//获取本地数据
} from 'react-native';

import TabNavigator from 'react-native-tab-navigator';//底部导航插件
//githup地址 https://github.com/exponentjs/react-native-tab-navigator

/**
 * import Icon from 'react-native-vector-icons/FontAwesome';
 * 字体图标插件 注意！！！不兼容安卓！！！
 * 可以使用阿里巴巴的iconfont的字体，放入android/app/src/man/assets/fongt目录里，
 * 使用 <Text style={{fontFamily: 'iconfont',fontSize:25,color:'#ccc'}}>&#xe604;</Text> 方式
*/

var List = require('./app/creation');//创意页面
var Edit = require('./app/edit');//编辑页面
var Account = require('./app/account');//账号页面
var Login = require('./app/common/login');//登录页面

var reactNative = React.createClass( {

    getInitialState(){
        return {
            islogin:false,
            selectedTab:'creation'
        }
    },

    componentDidMount(){
        this._islogin()
    },

    _islogin(){
        var _this = this
        AsyncStorage.getItem('user')
            .then((data) => {
                if(data){
                    _this.setState({
                        islogin:true
                    })
                }
            })
    },

    _updateLogin(){
        this.setState({
            islogin:true
        })
    },
  render() {

    if(!this.state.islogin){
      return <Login login={this._updateLogin}/>
    }
    return (
        <TabNavigator tabBarStyle={{ backgroundColor:'#FFF' }}>
          <TabNavigator.Item
              selected={this.state.selectedTab === 'creation'}
              title="视频"
              renderIcon={() =><Text style={{fontFamily: 'iconfont',fontSize:25,color:'#ccc'}}>&#xe604;</Text>}
              renderSelectedIcon={() => <Text style={{fontFamily: 'iconfont',fontSize:25,color:'#eb4f38'}}>&#xe604;</Text>}
              onPress={() => this.setState({ selectedTab: 'creation' })}>
            <Navigator
                initialRoute={{
                    name:'List',
                    component:List
                }}
                configureScene={(route) => {
                    return Navigator.SceneConfigs.FloatFromRight
                }}
                renderScene={(route, navigator) =>{
                    var Component = route.component
                    return <Component {...route.params} navigator={navigator}/>
                }}
            />
          </TabNavigator.Item>
          <TabNavigator.Item
              selected={this.state.selectedTab === 'edit'}
              title="录制"
              renderIcon={() =><Text style={{fontFamily: 'iconfont',fontSize:25,color:'#ccc'}}>&#xe603;</Text>}
              renderSelectedIcon={() => <Text style={{fontFamily: 'iconfont',fontSize:25,color:'#eb4f38'}}>&#xe603;</Text>}
              onPress={() => this.setState({ selectedTab: 'edit' })}>
            <Edit />
          </TabNavigator.Item>
          <TabNavigator.Item
              selected={this.state.selectedTab === 'acuont'}
              title="设置"
              renderIcon={() =><Text style={{fontFamily: 'iconfont',fontSize:25,color:'#ccc'}}>&#xe602;</Text>}
              renderSelectedIcon={() => <Text style={{fontFamily: 'iconfont',fontSize:25,color:'#eb4f38'}}>&#xe602;</Text>}
              onPress={() => this.setState({ selectedTab: 'acuont' })}>
            <Account/>
          </TabNavigator.Item>
        </TabNavigator>
    );
  }
})

AppRegistry.registerComponent('reactNative', () => reactNative);

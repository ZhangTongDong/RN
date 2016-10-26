'use strict'

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    ListView,
    TouchableHighlight,//透明的点击层
    View,
    ActivityIndicator,//下拉加载时转动的小圈圈
    RefreshControl,//下拉刷新组件
    Dimensions//可以获取window信息！！！！！！！
} from 'react-native';

var Detail = require('./detail');//详情页面

var Request = require('../common/rquest');//封装ajax的模块

var config = require('../common/config.js');//存放路径的模块

var width = Dimensions.get('window').width;//获取屏幕宽度

var cechedResuld={
    nextPage:1,
    items:[],
    total:0
}

var Row = React.createClass({

    getInitialState(){
       return{
           islike:false,
           data:this.props.data
       }
    },
    _up(){
        console.log(1)
        this.setState({
            islike:!this.state.islike
        })
    },

    render(){
        return (
            <TouchableHighlight onPress={this.props.onSelect}>
                <View style={styles.item}>
                    <Text style={styles.itemtitle}>
                        {this.state.data.title}
                    </Text>
                    <Image style={styles.thumb} source={{uri: this.state.data.shtumb}}>
                        <Text style={styles.play}>&#xe601;</Text>
                    </Image>
                    <View style={styles.footer}>
                        <View style={styles.handleBox}>
                            {
                                this.state.islike
                                    ? <Text onPress={this._up} style={styles.upDown}>&#xe605;</Text>
                                    :<Text onPress={this._up} style={styles.up}>&#xe606;</Text>
                            }

                            <Text onPress={this._up} style={styles.handleText}>喜欢</Text>
                        </View>
                        <View style={styles.handleBox}>
                            <Text style={styles.coment}>&#xe600;</Text>
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
})

var Creaction = React.createClass({

    getInitialState:function() {
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2//监听数据是否变化，如果变化就改变视图否则视图不变
        });
           return {
               isRefreshing:false,//下拉刷新，初始为false
               isLodingTail:false,//用来判断是否在加载中
               dataSource: ds.cloneWithRows([])//列表初始数据
           }
    },


    renderRow:function(rowData){
        return (
           <Row
               key={rowData._id}
               onSelect={() => this._loadPage(rowData)}
               data={rowData}>
           </Row>
        )
    },

    componentDidMount(){//组件安装完异步请求数据
        this._fetchData(1)
    },

    _fetchData(page){//获取首屏数据
        this.setState({
            isLodingTail:true
        })
        Request.get(config.Api.base+config.Api.creations,{aceccTocen:'abc',page:page})
            .then((data) => {
                if(data.success){

                    var items = cechedResuld.items.slice()
                    if(page!==0){
                        items = items.concat(data.data)
                        cechedResuld.nextPage++
                    }else {
                        items = data.data.concat(items)
                    }
                    cechedResuld.items = items
                    cechedResuld.total = data.total

                    if(page !== 0){
                        this.setState({
                            isLodingTail:false,
                            dataSource:this.state.dataSource.cloneWithRows(cechedResuld.items)
                        })
                    }else {
                        this.setState({
                            isRefreshing:false,
                            dataSource:this.state.dataSource.cloneWithRows(cechedResuld.items)
                        })
                    }
                }
            })
            .catch((error) => {
                if(page !==0){
                    this.setState({
                        isLodingTail:false,
                    })
                }else {
                    this.setState({
                        isRefreshing:false,
                    })
                }

                console.error(error);
            });
    },

    _hasMore(){
         return cechedResuld.items.length <= cechedResuld.total
    },

    _fetchMoreData(){//下拉获取更多内容的回调函数
        if(!this._hasMore() || this.state.isLodingTail){
            return
        }
        var page = cechedResuld.nextPage
        this._fetchData(page)
    },

    _renderFooter(){
        if(!this._hasMore() && cechedResuld.total!==0){
            return (
                <View style={styles.lodingMore}>
                    <Text style={styles.lodingText}>
                        没有更多数据了
                    </Text>
                </View>
            )
        }

        return (
            <ActivityIndicator
                style={styles.lodingMore}
            />
        )
    },

    _onRefresh(){
        if(!this._hasMore() || this.state.isRefreshing){
            return
        }
        this.setState({
            isRefreshing:true
        })
        this._fetchData(0)
    },
    _loadPage(rowData){
        this.props.navigator.push({
            name:'detail',
            component:Detail,
            params:{
                data:rowData
            }
        })
    },
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headertitle}>
                        首页列表
                    </Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderFooter={this._renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this._onRefresh}
                            tintColor="#ff0000"
                            title="拼命加载中..."
                        />
                    }
                    onEndReachedthreshold={20}//onEndReachedthreshold是下拉距离底部20的时候的监听
                    onEndReached={this._fetchMoreData}//onEndReached是下拉到底的监听
                    enableEmptySections = {true}//下个版本要用的属性 目前功能未知
                   // showsVerticalScrollIndicator{false}隐藏滚动条安卓下会报错 以后再查安卓，先注释掉
                >
                </ListView>
            </View>
        );
    }
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    header:{
        paddingTop:12,
        paddingBottom:12,
        backgroundColor:'#ee735c'
    },
    headertitle:{
        color:'#FFF',
        textAlign:'center',
        fontSize:16,
        fontWeight:'600'
    },
    item:{
        width:width,
        marginBottom:10,
        backgroundColor:'#FFF'
    },
    thumb:{
        width:width,
        height:width*0.63,
        resizeMode:'cover'
    },
    itemtitle:{
        padding:10,
        fontSize:18,
        color:'#333'
    },
    footer:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#eee'
    },
    handleBox:{
        padding:10,
        flexDirection:'row',
        justifyContent:'center',
        width:width/2-0.5,
        backgroundColor:'#FFF'
    },
    play:{
        fontFamily: 'iconfont',
        fontSize:38,
        color:'#ed7b66',
        position:'absolute',
        bottom:5,
        right:5,
        width:46,
        height:46,
        backgroundColor:'transparent',

    },
    upDown:{
        fontFamily: 'iconfont',
        fontSize:22,
        color:'#ed7b66'
    },
    up:{
        fontFamily: 'iconfont',
        fontSize:22,
        color:'#333'
    },
    coment:{
        fontFamily: 'iconfont',
        fontSize:22,
        color:'#333'
    },
    handleText:{
        paddingLeft:12,
        fontSize:18,
        color:'#ccc'
    },
    lodingMore:{
        marginVertical:20,
    },
    lodingText:{
        color:'#777',
        textAlign:'center'
    }
});

module.exports = Creaction;
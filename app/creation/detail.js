'use strict'

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    TextInput,
    RefreshControl,
    ListView,
    Modal
} from 'react-native';

 var Video = require('react-native-video').default//视频组件

 var Button = require('react-native-button').default//按钮组件

var width = Dimensions.get('window').width;//获取屏幕宽度

var Request = require('../common/rquest');//封装ajax的模块

var config = require('../common/config.js');//存放路径的模块

var commentList={
    itmes:[],
    total:0
}

var Detail = React.createClass({

    getInitialState(){

        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2//监听数据是否变化，如果变化就改变视图否则视图不变
        });

        return{
            data:this.props.data,//视频数据

            //视频播放器相关状态
            rate:1,//是否暂停
            muted:false,//是否静音
            resizeMode:'contain',//视频拉伸效果
            repeat:false,//是否重复播放
            loadOver:false,//是否开始播放
            progressBG:0,//完成加载的进度条
            progress:0,//当前播放的进度条进度条
            palyableDuration:0,//当前已完成的加载
            currentTime:0,//当前播放的位置
            paused:false,//是否暂停
            end:false,//判断视频是否播放结束

            //评论数据相关
            dataSource: ds.cloneWithRows([]),//评论初始数据
            isLodingTail:false,//判断是否加载中
            dataOver:false,//判断是否还有更多数据

            //表单相关状态
            modalVisible:false,//模态框是否显示
            text:'',//评论内容
            ongoing:false//评论是否正在提交中
        }
    },

    componentDidMount(){//组件安装完毕
        this._fetchData()
    },

    _backToList(){//返回视频列表
        this.props.navigator.pop()
    },

    _onLoadStart(){//当视频加载的瞬间的jiantin

    },
    _onLoad(data){//视频加载不断的监听

    },
    _onProgress(times){//每个250毫秒调用一次 并把当前播放的时间点作为参数

        var playableDuration = times.playableDuration
        var currentTime = times.currentTime
        var totalLength = this.state.data.times
        this.setState({
            progressBG:Number((playableDuration/totalLength).toFixed(2)),
            progress:Number((currentTime/totalLength).toFixed(2)),
            loadOver:true
        })
    },
    _onEnd(){//视频结束事件
        this.setState({
            progressBG:1,
            progress:1,
            end:true
        })
    },
    _onError(e){//视频出错事件

    },
    _stop(){//暂停视频
        this.setState({
            paused:true
        })
    },
    _start(){//继续播放视频
        this.setState({
            paused:false
        })
    },
    _replay(){//重新播放视频
        this.refs.videoPlayer.seek(0)
        this.setState({
            end:false
        })
    },

    _fetchData(){//ajax获取评论数据
        if(this.state.dataOver){
            return
        }
        this.setState({
            isLodingTail:true
        })

        Request.get(config.Api.base+config.Api.comment,{_id:this.state.data._id,aceccTocen:'abc'})
            .then((data) => {
                if(data.success){
                    var itmes = commentList.itmes.slice()
                    itmes = itmes.concat(data.data)
                    commentList.itmes = itmes
                    commentList.total = data.total
                    setTimeout(() => {
                        this.setState({
                            isLodingTail:false,
                            dataSource:this.state.dataSource.cloneWithRows(commentList.itmes)
                        })
                    },1000)
                }
            })
    },

    _fetchMoreData(){//获取更多的评论数据
        if(commentList.itmes.length >= commentList.total && this.state.isLodingTail){//判断数据是否加载完
            this.setState({
                dataOver:true
            })
            return
        }
        this._fetchData()
    },

    _renderFooter(){//评论列表的页脚
        if(this.state.dataOver){
            return (
                <Text style={{padding:5,color:'#666',alignSelf:'center'}}>
                    没有更多数据了...
                </Text>
            )
        }else {
            return(
                <ActivityIndicator
                    style={{marginVertical:20}}
                />
            )
        }
    },
    _modalVisible(){//显示模态框
        this.setState({
            modalVisible:true
        })
    },

    _clossModal(){//隐藏模态框
        this.setState({
            modalVisible:false,
            text:''
        })
    },

    _submit(){//提交评论
        if(this.state.ongoing && this.state.text !== ''){
           return
        }
        this.setState({
            ongoing:true
        })
        var data= {
            _id:this.state.data._id,
            name:'abc',
            content:this.state.text
        }
        Request.post(config.Api.base+config.Api.sbumitComment,data)
            .then((data) => {
                if(data.success){
                    console.log(data)
                    var newItem = [{
                        content:this.state.text,
                        name:'测试账号',
                        shtumb:'http://pic32.photophoto.cn/20140827/0017029348033562_b.jpg'
                    }]

                    var itmes = commentList.itmes.slice()
                    itmes = newItem.concat(itmes)
                    commentList.itmes = itmes

                    this.setState({
                        dataSource:this.state.dataSource.cloneWithRows(commentList.itmes),
                        ongoing:false
                    },() => {
                        this._clossModal()
                        console.log(this.state.dataSource)
                    })
                }
            })
    },

    _renderHeader(){//评论列表的头部
        var data = this.state.data
        return (
            <View>
                <View style={styles.owner}>
                    <Image style={styles.ownerImge} source={{uri:data.headerImg}}>
                    </Image>
                    <View style={styles.textBox}>
                        <Text style={styles.textHeader}>{data.userName}</Text>
                        <Text style={styles.textBody}>
                            {data.commentContent}
                        </Text>
                    </View>
                </View>
                <View style={styles.comment}>
                    <Text style={{flex:1,color:'#ccc'}} onPress={this._modalVisible}>点击评论...</Text>
                </View>
            </View>
        )
    },

    _renderRow(row){//评论列表
        return (
            <View style={styles.commentRow}>
                <Image style={styles.userImage} source={{uri:row.shtumb}}>
                </Image>
                <View style={styles.commentbox}>
                    <Text style={styles.commentHeader}>{row.name}</Text>
                    <Text style={styles.comentBody}>
                        {row.content}
                    </Text>
                </View>
            </View>
        )
    },


    render(){
        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.black} onPress={this._backToList}>
                        &#xe607;
                    </Text>
                    <Text style={styles.headerTitle}>
                        详情页面
                    </Text>
                </View>

                <View style={styles.videoBox}>
                    <Video
                         ref="videoPlayer"//视频组件的引用
                         source={{uri:this.state.data.video}}
                         style={styles.video}

                         volume={4}//视频声音放大倍数
                         paused={this.state.paused}//视频是否暂停 默认暂停
                         rate={this.state.rate}//取值 0 或者 1 ,0表示暂停，1表示正常
                         mured={this.state.muted}//是否静音 取值true或false ,true表示静音
                         resizeMode={this.state.resizeMode}//视频的拉伸方式 取值cantain，cover
                         repeat={this.state.repeat}//是否重复播放 取值true或false

                         onLoadStart={this._onLoadStart}//当视频加载的瞬间的jiantin
                         onLoad={this._onLoad}//视频加载不断的监听
                         onProgress={this._onProgress}//每个250毫秒调用一次 并把当前播放的时间点作为参数
                         onEnd={this._onEnd}//视频结束事件
                         onError={this._onError}//视频出错事件
                     />

                    {//加载中的动画
                        !this.state.loadOver
                        ?<ActivityIndicator style={styles.loading} onPress={this._repeat}/>
                        :null
                    }

                    {/*播放进度条*/}
                    <View style={[styles.progressBG,{width:width*this.state.progressBG}]}>
                        <View style={[styles.progressFront,{width:width*this.state.progress}]}>

                        </View>
                    </View>

                    {//点击暂停透明层
                        this.state.loadOver && !this.state.paused
                        ?<TouchableOpacity style={styles.stop} onPress={this._stop}>
                            <Text></Text>
                        </TouchableOpacity>
                         :null
                    }

                    {//点击再次开始
                        this.state.paused
                        ?<Text style={styles.play} onPress={this._start}>&#xe601;</Text>
                        :null
                    }

                    {//重新播放按钮
                        this.state.end
                        ?<Text style={styles.play} onPress={this._replay}>&#xe601;</Text>
                        :null
                    }
                </View>

                <ListView
                    dataSource={this.state.dataSource}
                    renderHeader={this._renderHeader}
                    renderFooter={this._renderFooter}
                    renderRow={this._renderRow}

                    onEndReachedthreshold={20}//onEndReachedthreshold是下拉距离底部20的时候的监听
                    onEndReached={this._fetchMoreData}//onEndReached是下拉到底的监听
                    enableEmptySections = {true}//下个版本要用的属性 目前功能未知

                >
                </ListView>

                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setState({modalVisible:false})}}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.closs} onPress={this._clossModal}>&#xe608;</Text>
                        <View style={styles.comentContent}>
                            <TextInput
                                autoFocus={true}
                                style={{flex:1,color:'#999',fontSize:16}}
                                textAlignVertical ="top"
                                underlineColorAndroid='transparent'
                                multiline={true}
                                placeholder="请输入评论内容"
                                placeholderTextColor="#ccc"
                                onChangeText={(text) => this.setState({text})}
                                value={this.state.text}
                            />
                        </View>


                        {
                            this.state.ongoing
                            ? <View style={{flexDirection:'row',justifyContent:'center',marginTop:10}}><ActivityIndicator/><Text>评论中...</Text></View>
                            : <Button style={styles.commentSubmit} onPress={this._submit}>评论</Button>
                        }


                    </View>
                </Modal>

            </View>
        );
    }
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    videoBox: {
        width: width,
        backgroundColor: '#000',
        height: width*0.56,
        marginBottom:5
    },
    video: {
        width: width,
        backgroundColor: '#000',
        height: width*0.56
    },
    loading: {
        position: 'absolute',
        top: parseInt(width*0.56/2),
        left: 0,
        width: width,
        alignSelf: 'center'
    },
    header:{
        paddingTop:12,
        paddingBottom:12,
        backgroundColor:'#ee735c'
    },
    headerTitle:{
        alignSelf:'center',
        color:'#fff',
        fontSize:16,
        fontWeight:'600'
    },
    black:{
        fontFamily: 'iconfont',
        fontSize:28,
        position:'absolute',
        left:5,
        top:6,
        color:'#fff'
    },
    progressBG:{
        height:2,
        position:'absolute',
        left:0,
        bottom:10,
        backgroundColor:'#EEE'
    },
    progressFront:{
        height:2,
        backgroundColor:'#ee735c'
    },
    stop:{
        width:width,
        height:280,
        position:'absolute',
        top:0,
        left:0
    },
    start:{
        position:'absolute',
        left:100,
        top:100,
        color:'#fff',
        alignSelf:'center',
        justifyContent:'center'
    },
    play:{
        position:'absolute',
        left:parseInt((width-38)/2),
        top:parseInt((width*0.56-38)/2),
        color:'#fff',
        fontFamily: 'iconfont',
        fontSize:38
    },
    owner:{
        flexDirection:'row',
        marginLeft:10,
        marginRight:10
    },
    ownerImge:{
        width:70,
        height:70,
        borderRadius:35,
        marginTop:5
    },
    textBox:{
        flex:1,
    },
    textHeader:{
        fontSize:16,
        paddingLeft:5,
        color:'#999',
        paddingTop:10
    },
    textBody:{
        fontSize:14,
        paddingLeft:5,
        color:'#999'
    },
    comment:{
        width:width-20,
        height:60,
        marginLeft:10,
        marginTop:5,
        borderWidth:1,
        borderColor:'#ccc',
        borderRadius:4,
        padding:5,
        backgroundColor:'#fff'
    },
    commentRow:{
        flexDirection:'row',
        marginLeft:10,
        marginRight:10
    },
    userImage:{
        width:60,
        height:60,
        borderRadius:30,
        marginTop:5
    },
    commentbox:{
        flex:1,
    },
    commentHeader:{
        fontSize:14,
        paddingLeft:5,
        color:'#999',
        paddingTop:10
    },
    comentBody:{
        fontSize:12,
        paddingLeft:5,
        color:'#999'
    },
    modalContainer:{
        flex:1,
        backgroundColor:'#F5FCFF',
        padding:10
    },
    closs:{
        fontFamily:'iconfont',
        color:'#ee735c',
        fontSize:38,
        alignSelf:'center'
    },
    comentContent:{
        marginTop:10,
        borderWidth:1,
        borderColor:'#ccc',
        height:100,
        borderRadius:4,
        paddingLeft:1,
        paddingRight:1
    },
    commentSubmit:{
        marginTop:10,
        padding:8,
        color:'#FFF',
        borderRadius:4,
        backgroundColor:'#ee735c'
    }

})
module.exports = Detail;
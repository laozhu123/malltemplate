const WXAPI = require('wxapi/main')

//app.js
App({
  navigateToLogin: false,
  onLaunch: function () {
    const that = this;
    /**
         * 初次加载判断网络情况
         * 无网络状态下根据实际情况进行调整
         */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: function () {
            that.goStartIndexPage()
          }
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    });

    //  获取商城名称
    WXAPI.queryConfigBatch('mallName,recharge_amount_min,ALLOW_SELF_COLLECTION').then(function (res) {
      if (res.code == 0) {
        res.data.forEach(config => {
          console.log(config.key,config.value)
          wx.setStorageSync(config.key, config.value);
          if (config.key === 'recharge_amount_min') {
            that.globalData.recharge_amount_min = res.data.value;
          }
        })

      }
    })
    WXAPI.scoreRules({
      code: 'goodReputation'
    }).then(function (res) {
      if (res.code == 0) {
        that.globalData.order_reputation_score = res.data[0].score;
      }
    })

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  globalData: {
    userInfo: null,
    isConnected: true,
    vipLevel: 0
  },
  goLoginPageTimeOut: function () {
    if (this.navigateToLogin) {
      return
    }
    wx.removeStorageSync('token')
    this.navigateToLogin = true
    setTimeout(function () {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
    }, 1000)
  },
}
)
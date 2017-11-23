const app = app || getApp();
const zutils = require('../../utils/zutils.js');

Page({
  data: {},

  onLoad: function (e) {
    var that = this;
    zutils.get(app, 'api/home/banners', function (res) {
      that.setData({
        banners: res.data.data
      })
    });

    app.getUserInfo(function () {
      zutils.get(app, 'api/home/recent-exams', function (res) {
        that.setData(res.data.data);
        that.__checkTwxx(e.q);
      });
    });
  },

  __checkTwxx: function (q) {
    if (q && decodeURIComponent(q).indexOf('/t/wxx/') > -1) {
      zutils.get(app, 'api/share/parse-twxx?q=' + q, function (res) {
        if (res.data.error_code == 0) {
          wx.navigateTo({
            url: res.data.data
          })
        }
      });
    }
  },

  onShow: function () {
    if (zutils.array.inAndErase(app.GLOBAL_DATA.RELOAD_EXAM, 'Index')) {
      var that = this;
      zutils.get(app, 'api/home/recent-exams', function (res) {
        that.setData(res.data.data);
      });
    }
  },

  todayExam: function () {
    var that = this;
    zutils.post(app, 'api/exam/today-exam', function (res) {
      if (res.data.error_code == 0) {
        var data = res.data.data;
        wx.redirectTo({
          url: '../exam/exam?subject=' + data.subject_id + '&exam=' + data.exam_id
        });
      } else {
        var error_msg = res.data.error_msg || '系统错误';
        if (error_msg.indexOf('考试类型') > -1 || error_msg.indexOf('尚未选择') > -1) {
          wx.navigateTo({
            url: '../question/subject-choice?back=1'
          });
        } else {
          wx.showModal({
            title: '提示',
            content: error_msg,
            showCancel: false
          });
        }
      }
    });
  },

  signin: function () {
    zutils.post(app, 'api/home/signin', function (res) {
      if (res.data.error_code == 0) {
        app.GLOBAL_DATA.RELOAD_COIN = ['Home'];
        wx.showToast({
          title: '签到成功',
          icon: 'success'
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.error_msg || '系统错误',
          showCancel: false
        })
      }
    });
  },

  onShareAppMessage: function () {
    return app.warpShareData();
  }
})
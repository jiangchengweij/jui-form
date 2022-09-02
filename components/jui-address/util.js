import QQMapWX from './qqmap-wx-jssdk.js';

const qqmapsdk = new QQMapWX({
  key: 'IDJBZ-XG5L4-2HSUD-X2IYF-PUGE7-LCBFJ'
})
/**
 * 获取用户当前位置信息
 *
 * @export
 */
export function getLocation () {
  return new Promise((resolve, reject) => {
    const scope = 'scope.userLocation'
    const modal = {
      title: '授权',
      content: '需要您授权使用位置信息',
      confirmText: '设置'
    }
    setAuthorize(scope, modal)
      .then(() => {
        uni.getLocation({
          altitude: true,
          success: res => {
            resolve(res)
          },
          fail: err => {
            reject(err)
            uni.showToast({
              title: '获取位置信息失败',
              icon: 'none',
              duration: 3000
            })
          }
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 逆地址解析（坐标转具体位置信息）
 * @doc 文档参考：https://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
 * @export
 * @param {*} location 坐标：{ latitude: 39.984060, longitude: 116.307520 }
 * @returns
 */
export function reverseGeocoder (location) {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location: location,
      get_poi: 1,
      poi_options: 'policy=1;page_size=20;page_index=1',
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
        uni.showToast({
          title: err.message,
          icon: 'none',
          duration: 3000
        })
      }
    })
  })
}
<template>
  <view class="jui-select-map">
    <view class="jui-select-map__content" @tap="openMap">
      <uni-icons type="location" size="16"></uni-icons>
      <view class="jui-value-show">
        <uni-load-more v-if="location.loading" status="loading"></uni-load-more>
        <text v-else-if="location.error" class="jui-error-text">{{ location.errorInfo }}</text>
        <text v-else class="jui-value-text">{{ address }}</text>
      </view>
      <uni-icons v-if="readonly == false" type="right" size="16"></uni-icons>
    </view>
  </view>
</template>

<script>
  import { getLocation, reverseGeocoder } from './util.js';

  export default {
    emits: ['update:modelValue, change'],
    props: {
      field: {
        type: Boolean,
        default: ''
      },
      modelValue: {
        type: [Object, String],
        default: '' //{ lng: '', lat: '', address: '' }
      },
      readonly: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        location: {
          loading: true,
          error: false,
          errorInfo: '定位失败',
          curLocation: null // 当前位置信息
        },
        val: null,
        address: '',
        eventName: '',
      }
    },
    watch: {
      modelValue(newVal) {
        if(newVal && newVal !== '') {
          //需要获取位置信息
          if(!newVal.address || newVal.address == '') {
            this.getLocationInfo({ longitude: newVal.lng, latitude: newVal.lat });
          }
        }
        if (this.form && this.formItem && !this.is_reset) {
        	this.is_reset = false
        	this.formItem.setValue(newVal)
        } else if(this.is_reset) {
          this.is_reset = false
          this.getCurLocation(); //重新获取位置
        }
      }
    },
    created() {
      if(!this.modelValue) {
        this.getCurLocation();
      }
    },
    mounted() {
      //位置信息重新选择
      uni.$on(this.eventName, (data) => {
        if (data) {
          const { lng, lat } = data.location
          this.val = {
            lng: lng,
            lat: lat,
            address: data.title
          };
          this.address = data.title;
        }
        this.$emit('update:modelValue', this.val);
        this.$emit('change', this.val);
      })
    },
    methods: {
      // 获取当前定位
      getCurLocation () {
      	this.location.loading = true
      	this.location.error = false
        getLocation()
          .then(res => {
      			const { longitude, latitude } = res;
      			this.getLocationInfo({ longitude, latitude })
          })
          .catch((e) => {
            this.location.loading = false
            this.location.error = true
          })
      },
      openMap() {
        if(this.readonly) { //只读
          return;
        }
        if (this.location.curLocation) {
          const { lng, lat } = this.location.curLocation.location;
          uni.navigateTo({ url: `/pages/select_map/select_map?eventName=${this.eventName}&latitude=${lat}&longitude=${lng}` });
        }
      },
      // 获取位置信息
      getLocationInfo (location) {
        // reverseGeocoder(location)
        //   .then(res => {
        //     this.val = {
        //       address: res.result.pois[0].title,
        //       lng: location.longitude,
        //       lat: location.latitude
        //     };
        //     this.address = res.result.pois[0].title;
      		// 	this.location.curLocation = res.result
        //     this.location.error = false;
        //     this.location.loading = false;
        //     this.$emit('update:modelValue', this.val);
        //     this.$emit('change', this.val);
        //   })
        //   .catch(err => {
        //     this.location.loading = false
        //     this.location.error = true
        //   })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .jui-select-map__content {
    flex: 1;
    /* #ifndef APP-NVUE */
    width: 100%;
    display: flex;
    box-sizing: border-box;
    /* #endif */
    flex-direction: row;
    align-items: center;
  }
  .jui-value-show {
    flex: 1;
    margin-left: 10rpx;
  }
  .jui-value-error {
    color: $uni-color-error;
  }
  .jui-value-text {
    color: $uni-color-primary;
  }
</style>
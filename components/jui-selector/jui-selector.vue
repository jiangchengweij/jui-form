<template>
  <view class="jui-selector">
    <view class="content" @click="openDrawer()">
      <template v-if="mode === 'card'">
        <view class="is-card"
        :style="{
          height: height ? getRpx(height) : '100rpx',
        }"
        >
          <view class="img-panel" :style="{
            height: height ? getRpx(height) : '100rpx',
            width: height ? getRpx(height) : '100rpx'
            }">
            <image class="img" :class="iconClass" :style="{
              height: height ? getRpx(height) : '100rpx',
              width: height ? getRpx(height) : '100rpx'
            }" v-if="showInfo.icon && showInfo.icon !== ''" :src="showInfo.icon" mode="aspectFill">
            </image>
          </view>

          <view class="info-panel">
            <view v-for="(item, index) in showInfo.info" :key="item.text">
              <text class="info-label" :class="item.labelClass">{{ item.label }}</text>
              <text class="info-text" :class="item.textClass">{{ item.text }}</text>
            </view>
          </view>
          <uni-icons :size="28" type="forward"></uni-icons>
        </view>
      </template>
      <template v-else>
        <view v-if="showInfo" class="is-normal">
          <view class="body">
            <text :class="{ 'is--placeholder': showInfo.placeholder }">{{ showInfo.text ? showInfo.text : showInfo.placeholder }}</text>
          </view>
          <view class="footer">
            <uni-icons :size="14" color="#999" type="forward"></uni-icons>
          </view>
        </view>
      </template>
    </view>
  </view>
  <uni-drawer class="jui-selector-drawer" ref="drawer" :width="300">
    <view>
      <uni-nav-bar :title="selectTitle" />
      <scroll-view :style="{
        height: scrollHeight
      }" class="select-content" :scroll-y="true">
        <template v-for="(item, index) in options" :key="item[map.value]">
          <view 
            class="cell"
            @click="onSelect(item, index)"
            hover-class="is--hover"
            :hover-stay-time="100"
          >
            <view class="cell__body">
              <text>{{ getKeyVal(map.text, item) }}</text>  
            </view>
            <view class="cell__footer">
              <text v-if="item[map.subTitle]">{{ item[map.subTitle] }}</text>
              <uni-icons color="#999" type="forward"></uni-icons>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </uni-drawer>
</template>

<script>
  import { computed, ref, watch } from 'vue';
  import { getRpx } from '../jui-form/util.js';
  export default {
    props: {
      mode: {
        type: String,
        default: 'normal',
      },
      modelValue: {
      	type: [Array, String, Number],
      	default() {
      		return '';
      	}
      },
      multiple: {
      	type: Boolean,
      	default: false
      },
      options: {
      	type: Array,
      	default () {
      		return []
      	}
      },
      disabled:{
      	type: Boolean,
      	default: false
      },
      map: {
        type: Object,
        defalut: { text: 'text', value: 'value', subTitle: 'subtitle' }
      },
      placeholder: String,
      placeholderStyle: String,
      height: {
        type: [String, Number],
        default: '100',
      },
      selectTitle: {
        type: String,
        default: ''
      }
    },
    setup(props, { emit }) {
      const val = ref('');
      const selectIndex = ref(-1);
      const drawer = ref(null);
      const scrollHeight = ref('');
      
      initScroll();
      
      function initScroll() {
        const info = uni.getWindowInfo();
        scrollHeight.value = (info.windowHeight - 44) + 'px';
      }
      
      watch(() => props.modelValue, (newVal) => {
        val.value = newVal;
      }, {
        immediate: true
      })
      
      watch( () => props.options, () => {
        //重新选择
        val.value = '';
        selectIndex.value = -1;
      })
      
      const showInfo = computed(() => {
        const { options, map, placeholder, mode } = props;
        if(mode === 'card') {
          const infoObj = {
            info: [],
          }
          if (map.info && Array.isArray(map.info)) { //info是否存在
            map.info.forEach((obj) => {
              const tempObj = { 
                label: obj.label,
                text: '',
              };
              if (selectIndex.value > -1) {
                if (typeof obj.text === 'function') {
                  tempObj.text = obj.text.call(null, options[selectIndex.value]);
                } else {
                  tempObj.text = options[selectIndex.value][obj.text];
                }
              }
              infoObj.info.push(tempObj);
            })
          }
          if(map.icon) {
            if (selectIndex.value > -1) {
              if(typeof map.icon === 'function') {
                infoObj.icon = map.icon.call(null, options[selectIndex.value.value]);
              } else {
                infoObj.icon = options[selectIndex.value][map.icon]
              }
            }
          }
          return infoObj;
        } else {
          if(selectIndex.value === -1) {
            return { placeholder };
          }
          if(typeof map.text === 'string') {
            return { text: options[selectIndex.value][map.text]};
          } else if (typeof map.text === 'function'){
            let tempText = map.text.call(null, options[selectIndex.value]);
            return { text: tempText}
          }
          return null;
        }
      })
      
      function onSelect(item, index) {
        const { map, multiple, disabled } = props;
        if(disabled) return;
        val.value = item[map.value];
        selectIndex.value = index;
        if (!multiple) {
          closeDrawer();
        }
        emit('update:modelValue', val.value);
        emit('change', { item, value: val.value });
      }
      
      function openDrawer() {
        drawer.value.open();
      }
      
      function closeDrawer() {
        drawer.value.close();
      }
      
      function getKeyVal(key, item) {
        if (typeof key === 'function'){
          return key.call(null, item);
        } else {
          return item[key];
        }
      }
      return {
        showInfo,
        onSelect,
        drawer,
        openDrawer,
        getRpx,
        getKeyVal,
        scrollHeight
      }
    }
  }
</script>

<style lang="scss" scoped>
  .select-content {
    display: flex;
    flex-direction: column;
    .cell {
      display: flex;
      padding: 26rpx;
      position: relative;
      height: 28rpx;
      font-size: 28rpx;
      line-height: 28rpx;
      &__body {
        flex: 1;
      }
      &__footer {
        display: flex;
        color: #f8f8f8;
        .icon {
          color: #f8f8f8;
        }
      }
      &::after {
        position: absolute;
        box-sizing: border-box;
        content: " ";
        pointer-events: none;
        right: 0;
        bottom: 0;
        left: 0;
        border-bottom: 1px solid rgb(235, 237, 240);
        transform: scaleY(.5)
      }
    }
  }
  .is-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    .img-panel {
      margin-right: 20rpx;
      .img {
        border-radius: 4rpx;
      }
    }
    .info-panel {
      flex-grow: 1;
      line-height: 1.6;
    }
  }
  .is-normal {
    display: flex;
    flex-direction: row;
    align-items: center;
    .body {
      flex-grow: 1;
    }
    .is--placeholder {
      color: #808080;
    }
  }
</style>
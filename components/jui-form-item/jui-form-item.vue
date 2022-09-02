<template>
  <view 
    class="jui-form-item"
    :class="{ 'item--border': border, 'is-first-border': border && isFirstBorder, 'item-error': msg }"
  >
    <view class="item__box">
      <view class="item__inner">
        <view class="item__label" v-if="label && label!==''" :style="{ width: labelWidth }">
          <slot name="label">
          	<text v-if="required" class="is-required">*</text>
          	<uni-icons v-if="leftIcon" class="label-icon" size="16" :type="leftIcon" :color="iconColor" />
          	<text class="label-text">{{ label }}</text>
          	<view v-if="label" class="label-seat"></view>
          </slot>
        </view>
        <view class="item__content" :class="{ 'is-input-error-border': msg }">
          <slot></slot>
        </view>
        <view class="suffix">
          <slot name="suffix">
            <text>{{ suffixText }}</text>
          </slot>
        </view>
      </view>
      <view
      	v-if="showMsg"
      	class="error-message"
      	:class="{ 'error-msg--boeder': border }"
      	:style="{
      		paddingLeft: labelLeft
      	}"
      >
      	<text class="error-message-text">{{ msg }}</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { watch, ref, computed } from 'vue';
  export default {
    props: {
      mode: {
        type: String,
      },
      required: Boolean,
      label: String,
      // 左边标题的宽度单位px
      labelWidth: {
      	type: [Number, String],
      	default: '65px',
      },
      // 对齐方式，left|center|right
      labelAlign: {
      	type: String,
      	default: ''
      },
      // lable的位置，可选为 left-左边，top-上边
      labelPosition: {
      	type: String,
      	default: 'left'
      },
      leftIcon: String,
      iconColor: {
      	type: String,
      	default: '#606266'
      },
      isFirstBorder: {
        type: Boolean,
        default: false
      },
      // 表单校验规则
      rules: {
      	type: Array,
      	default() {
      		return [];
      	}
      },
      name: {
        type: String,
      },
      errMsg: {
        type: String,
        default: '',
      },
      suffixText: {
        type: String,
        default: '',
      }
    },
    setup(props) {
      const showMsg = ref(false);
      const msg = ref('');      
      
      const labelLeft = computed(() => {
        if(!props.labelWidth){ return '0px' }
        if(/^\d+$/.test(props.labelWidth)) {
          return props.labelWidth + 'px';
        }
        return props.labelWidth;
      })
      
      watch(() => props.errMsg, (newMsg) => {
        showMsg.value = false;
        msg.value = '';
        if(newMsg && newMsg.length > 0) {
          showMsg.value = true;
          msg.value = newMsg;
        }
      })
      return {
        showMsg,
        msg,
        border: false,
        labelLeft,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .jui-form-item {
    position: relative;
    padding: 28rpx 0;
    text-align: left;
    color: #333;
    font-size: 28rpx;
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
  .item__box {
    position: relative;
    .item__inner {
      display: flex;
      align-items: center;
      .item__label {
        /* #ifndef APP-NVUE */
        display: flex;
        flex-shrink: 0;
        box-sizing: border-box;
        /* #endif */
        flex-direction: row;
        align-items: center;
        width: 65px;
        .label-icon {
        	margin-right: 5px;
        	margin-top: -1px;
        }
        .label-text {
        	color: #666666;
        }
        .label-seat {
        	margin-right: 5px;
        }
      }
    }
    .item__content {
      /* #ifndef APP-NVUE */
      width: 100%;
      box-sizing: border-box;
      /* #endif */
      flex: 1;
    }
  }
  
  .is-required {
  	// color: $uni-color-error;
  	color: #dd524d;
  	font-weight: bold;
  }
  
  .error-message {
  	text-align: left;
  }
  
  .error-message-text {
  	line-height: 22px;
  	color: #dd524d;
  	font-size: 12px;
  }
</style>
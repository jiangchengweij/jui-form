<template>
  <view 
    class="jui-date-picker"
  >
    <uni-datetime-picker
      ref="datePicker"
      :type="type"
      @change="onChange"
    >
      <view class="content">
        <template v-if="isRange">
          <input class="jui-date-input" type="text" :value="val.start" :placeholder="startPlaceholder" :disabled="true">
          <view class="jui-date-input-separator">
            <text>{{ rangeSeparator }}</text>
          </view>
          <input class="jui-date-input" type="text" :value="val.end" :placeholder="endPlaceholder" :disabled="true">
        </template>
        <template v-else>
          <view class="jui-date-input" :class="{ 'is-placeholder': isPlaceholder }">
            <text v-if="isPlaceholder">{{ placeholder }}</text>
            <text v-else>{{ curVal.date }}</text>
          </view>
        </template>
      </view>
    </uni-datetime-picker>
  </view>
</template>
<script>
  /**
   * 	 * @property {String} type 选择器类型
	 * @property {String|Number|Array|Date} modeValue 绑定值
	 * @property {String} placeholder 单选择时的占位内容
	 * @property {String} start 起始时间
	 * @property {String} end 终止时间
	 * @property {String} start-placeholder 范围选择时开始日期的占位内容
	 * @property {String} end-placeholder 范围选择时结束日期的占位内容
	 * @property {String} range-separator 选择范围时的分隔符
	 * @property {Boolean} border = [true|false] 是否有边框
	 * @property {Boolean} disabled = [true|false] 是否禁用
	 * @event {Function} change 确定日期时触发的事件
	 * @event {Function} show 打开弹出层
	 * @event {Function} close 关闭弹出层
	 * @event {Function} clear 清除上次选中的状态和值
   */
  import { computed, reactive, watch, ref } from 'vue';
  export default {
    emits: ['change', 'show', 'close', 'update:modelValue'],
    props: {
      type: {
        type: String,
        default: 'date' //date/daterange/datetime
      },
      modelValue: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: ''
      },
      startPlaceholder: {
        type: String,
        default: '',
      },
      endPlaceholder: {
        type: String,
        default: '',
      },
      start: {
        type: String,
        default: '',
      },
      end: {
        type: String,
        default: '',
      },
      rangeSeparator: {
        type: String,
        default: '',
      },
      border: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      returnType: {
        type: String,
        default: 'tring'
      }
    },
    setup(props, { emit }) {
      const curVal = reactive({
        start: '',
        end: '',
        date: ''
      });
      
      const isPlaceholder = ref(true);
      
      watch(() => props.modelValue, (newValue) => {
        
        if (typeof newValue === 'string' && newValue!=='') {
          curVal.date = newValue;
          isPlaceholder.value = false;
          return;
        }
        if (Array.isArray(newValue)) {
          curVal.start = newValue[0];
          curVal.end = newValue[1];
          isPlaceholder.value = false;
          return;
        }
        curVal.start = '';
        curVal.end = '';
        curVal.date = '';
        isPlaceholder.value = true;
      }, {
        immediate: true,
      })
      
      const isRange = computed(() => {
        const { type } = props;
        if(type == 'daterange' || type == 'datetimerange') {
          return true;
        }
        return false;
      })
      
      function onChange(event) {
        if(isRange.value) {
          curVal.start = event[0];
          curVal.end = event[1];
        } else {
          curVal.date = event;
        }
        emit('change', event);
        emit('update:modelValue', event);
      }

      return {
        onChange,
        isRange,
        curVal,
        isPlaceholder
      }
    }
  }
</script>

<style lang="scss" scoped>
  .jui-date-picker {
    .content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .jui-date-input {
        flex: 1;
      }
      .jui-date-input-separator {
        margin: 0 10px;
      }
      .is-placeholder {
        color: #808080;
      }
    }
  }
</style>
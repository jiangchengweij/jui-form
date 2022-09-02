<template>
  <view class="jui-sub-form">
    <jui-form-item
      :label="item.label"
      :labelWidth="labelWidth"
      :name="item.field"
      :required="item.required"
      :suffixText="item.suffixText ? item.suffixText : ''"
      :labelPosition="item.labelPosition"
      :errMsg="formErrMsg[item.field] ? formErrMsg[item.field].errorMessage : ''"
    >
      <view class="jui-sub-form_content" @click="onAdd">
        <view class="body" :class="{ 'is-placeholder': showSubList.length === 0 }">
          <text>{{ showText }}</text>
        </view>
        <view class="footer">
          <uni-icons type="plusempty" :size="20"></uni-icons>
        </view>
      </view>
    </jui-form-item>
    <view class="jui-sub-list">
      <view v-for="(item, index) in showSubList" :key="index" class="cell">
        <view class="header">
          <view v-if="showOrder">
            <uni-icons v-if="!disabled" color="#dd524d" @click="onMinus(index)" type="minus-filled" :size="16"></uni-icons>
            <text>序号:</text>
            <text>{{ (index+1) }}</text>
          </view>
          <template v-if="item.header">
            <view v-for="(head, hindex) in item.header" :key="hindex">
              <text>{{ head.text }}</text>
              <text>{{ head.val }}</text>
            </view>
          </template>
          <view @click="onToggerItem(index)">
            <uni-icons :type="item.show ? 'bottom' : 'forward'" :size="18"></uni-icons>
          </view>
        </view>
        <view class="body" v-if="item.show">
          <view class="cell" v-for="(bd, bindex) in item.body" :key="bindex">
            <text>{{ bd.text }}: </text><text>{{ bd.value }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { ref, reactive, watch, computed } from 'vue';
  export default {
    emits: ['add', 'edit', 'minus'],
    props: {
      schemas: {
        type: Array,
        default: []
      },
      labelWidth: {
        type: String,
        default: '',
      },
      item: {
        type: Object,
      },
      formErrMsg: {
        type: Object,
      },
      modelValue: {
        type: Array,
        default: [],
      },
      showOrder: {
        type: Boolean,
        default: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      placeholder: String,
      map: {
        type: Object,
        default: {
          title: { text: '共计: ', value: (sublist) => sublist.length+'条' },
          subTitle: [],
        }
      }
    },
    setup(props, { emit }) {
      const showSubList = ref([]);
      
      watch(() => props.modelValue, (newValue) => {
        if(newValue && Array.isArray(newValue)) {
          initShowSubList(newValue);
          return
        }
      }, {
        immediate: true,
        deep: true,
      });
      
      const showText = computed(() => {
        const { placeholder, label, map, item } = props;
        if (showSubList.value.length === 0) {
          if (placeholder) {
            return placeholder;
          }
          return '点击添加'+item.label;
        } else {
          if (map.title && (map.title.text && typeof map.title.text.value === 'function')) {
            const tempText = map.title.text.value.apply(null, showSubList.value);
            return map.title.text+tempText;
          }
          return '已添加: '+showSubList.value.length;
        }
      })
      
      function initShowSubList(subList) {
        const { map, item } = props;
        showSubList.value = [];
        subList.forEach((obj) => {
          let tempObj = {
            body: [],
            show: false,
          }
          if(map.header && map.header.length > 0) {
            
          }
          //显示所有输入的值
          if(item.schemas && item.schemas.length > 0) {
            item.schemas.forEach((schema) => {
              tempObj.body.push({ text: schema.label, value: obj[schema.field] });
            })
          }
          showSubList.value.push(tempObj);
        })
      }
      
      function onToggerItem(index) {
        showSubList.value[index].show = !showSubList.value[index].show;
      }
      //由父元素控制弹窗
      function onAdd() {
        if(props.disabled) return;
        emit('add', { field: props.item.field });
      }
      
      function onMinus(index) {
        emit('minus', { index, field: props.item.field });
      }
      return {
        onAdd,
        onMinus,
        showSubList,
        onToggerItem,
        showText
      }
    }
  }
</script>

<style lang="scss" scoped>
  .popup-content {
    display: flex;
    flex-direction: column;
    height: 400px;
    width: 100%;
  }
  .jui-sub-list {
    .header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 10rpx 0;
    }
    .body {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      font-size: 24rpx;
      padding: 10rpx 16rpx;
      background-color: #999;
      .cell {
        line-height: 1.6;
        width: 32%;
      }
    }
  }
  .jui-sub-form_content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .is-placeholder {
      color: #808080;
    }
  }
</style>
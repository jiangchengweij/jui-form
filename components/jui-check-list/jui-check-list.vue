<template>
  <view class="jui-check-list">
    <checkbox-group 
      v-if="multiple"
      class="check-list-group"
      :class="{'is-list': mode === 'list' || wrap}"
      @change="change"
      >
      <label 
        v-for="(item, index) in dataList" :key="index"
        class="check-list-box"
        :class="['is--' + mode, item]" >
        <checkbox 
          class="hidden" 
          hidden 
          :disabled="disabled || !!item.disabled">
        </checkbox>
        <view 
          v-if="(mode !=='tag' && mode !== 'list') || ( mode === 'list' && icon === 'left')"
          class="checkbox__inner"
          :style="item.styleIcon"
        >
          <view class="checkbox__inner-icon"></view>
        </view>
        <view 
          class="check-list-content"
          :class="{'list-content':mode === 'list' && icon ==='left'}">
          <text 
            class="check-list-text"
            :style="item.styleIconText">{{item[map.text]}}
          </text>
          <view 
            v-if="mode === 'list' && icon === 'right'"
            class="checkobx__list" :style="item.styleBackgroud">
          </view>
        </view>
      </label>
    </checkbox-group>
    <radio-group 
      v-else 
      class="check-list-group"
      :class="{'is-list':mode==='list','is-wrap':wrap}"
      @change="change"
    >
      <label 
        v-for="(item,index) in dataList" :key="index"
        class="check-list-box"
        :class="[
          'is--' + mode,
          item.selected ? 'is-checked' : '',
          (disabled || !!item.disabled) ? 'is-disable' : '',
          index !==0 && mode === 'list' ? 'is-list-border' : ''
        ]"
        :style="item.styleBackgroud" 
      >
        <radio 
          class="hidden" hidden 
          :disabled="disabled || item.disabled" 
          :value="item[map.value]+''" 
          :checked="item.selected" 
        />
        <view 
          v-if="(mode !=='tag' && mode !== 'list') || ( mode === 'list' && icon === 'left')" 
          class="radio__inner"
          :style="item.styleBackgroud"
        >
          <view class="radio__inner-icon" :style="item.styleIcon"></view>
        </view>
        <view 
          class="check-list-content"
          :class="{'list-content':mode === 'list' && icon ==='left'}"
        >
          <text class="check-list-text" :style="item.styleIconText">{{item[map.text]}}</text>
          <view v-if="mode === 'list' && icon === 'right'" :style="item.styleRightIcon" class="checkobx__list"></view>
        </view>
      </label>
    </radio-group>
  </view>
</template>

<script>
  import { ref, reactive, watch } from 'vue';
  export default {
    emits: ['change', 'update:modelValue'],
    props: {
      mode: {
      	type: String,
      	default: 'default'
      },
      multiple: {
      	type: Boolean,
      	default: false
      },
      modelValue: {
      	type: [Array, String, Number],
      	default() {
      		return '';
      	}
      },
      options: {
      	type: Array,
      	default () {
      		return []
      	}
      },
      selectedColor: {
      	type: String,
      	default: ''
      },
      selectedTextColor: {
      	type: String,
      	default: ''
      },
      disabled:{
      	type: Boolean,
      	default: false
      },
      map: {
        type: Object,
        defalut: { text: 'text', value: 'value' }
      },
      wrap: {
      	type: Boolean,
      	default: false
      },
    },
    setup(props, { emit }) {
      const dataList = ref([]);
      const range = ref([]);
      
      watch(() => props.modelValue, (newVal) => {
				setDataList(newVal);
				// if(!this.is_reset){
				// 	this.is_reset = false
				// 	this.formItem && this.formItem.setValue(newVal)
				// }
      })
      
      watch(() => props.options, (newVal) => {
        range.value = newVal;
        setDataList(getSelectedValue());
      }, {
        immediate: true
      })
      
      /**
       * 获取选中值
       * @param {Object} range
       */
      function getSelectedValue() {
        if (!props.multiple) return props.modelValue
        let selectedArr = [];
        range.value.forEach((item) => {
        	if (item.selected) {
        		selectedArr.push(item[props.map.value]);
        	}
        });
        return selectedArr;
      }
      
      function change(e) {
        const values = e.detail.value;
        const detail = {
          value: '',
          data: null
        }
        if(props.multiple) {
          range.value.forEach(item => {
            if (values.includes(item[props.map.value] + '')) {
            	detail.value.push(item[props.map.value]);
            	detail.data.push(item);
            }
          })
        } else {
          const item = range.value.find(item => (item[props.map.value] + '') === values);
          if (item) {
            detail.value = item[props.map.value];
            detail.data = item
          }
        }
        
        emit('update:modelValue', detail.value);
        emit('change', {
        	detail
        })
      }
      
      /**
       * 设置新的渲染数组
       * @param {Object} value 选中内容
       */
      function setDataList(value) {
        let tempDataList = JSON.parse(JSON.stringify(range.value));
        if (props.multiple) {
        	if (!Array.isArray(value)) {
        		value = []
        	}
        }
        let tempList = [];
        tempDataList.forEach((item, index) => {
          item.disabled = item.disable || item.disabled || false;
          if (props.multiple) {
            if (value.length > 0) {
              let have = value.find(val => val === item[props.map.vaue])
              item.selected = have !== undefined;
            } else {
              item.selected = false;
            }
          } else {
            item.selected = value === item[props.map.value]
          }
          tempList.push(item);
        })
        setRange(tempList);
      }
      
      /**
			 * 处理最大最小值
			 * @param {Object} list
       */
      function setRange(list) {
        const selectList = list.filter(item => item.selected);
        const tempList = [];
        const min = Number(props.min) || 0;
        const max = Number(props.max) || '';
        
        list.forEach((item, index) => {
          if (props.multiple) {
            if (selectList.length <= min) {
              let have = selectList.find(val => val[props.map.value] === item[props.map.value]);
            }
            if (selectList.length >= max && max !== '') {
            	let have = selectList.find(val => val[props.map.value] === item[props.map.value])
            	if (have === undefined) {
            		item.disabled = true
            	}
            }
          }
          setStyle(item);
          list[index] = item;
        })
        dataList.value = list;
      }
      
      
      //设置样式
      const styles = reactive({
        selectedColor: '#2979ff',
        selectedTextColor: '#666',
      })
      
      /**
       * 设置 class
       * @param {Object} item
       */
      function setStyle(item) {
        item.styleBackgroud = setStyleBackgroud(item)
        item.styleIcon = setStyleIcon(item)
        item.styleIconText = setStyleIconText(item)
        item.styleRightIcon = setStyleRightIcon(item)
      }
      
      /**
       * 设置背景样式
       */
      function setStyleBackgroud(item) {
      	let styles = {}
      	let selectedColor = props.selectedColor?props.selectedColor:'#2979ff'
      	if (props.mode !== 'list') {
      		styles['border-color'] = item.selected?selectedColor:'#DCDFE6'
      	}
      	if (props.mode === 'tag') {
      		styles['background-color'] = item.selected? selectedColor:'#f5f5f5'
      	}
      	let classles = ''
      	for (let i in styles) {
      		classles += `${i}:${styles[i]};`
      	}
      	return classles
      }
      
      function setStyleIcon(item) {
      	let styles = {}
      	let classles = ''
      	let selectedColor = props.selectedColor?props.selectedColor:'#2979ff'
      	styles['background-color'] = item.selected?selectedColor:'#fff'
      	styles['border-color'] = item.selected?selectedColor:'#DCDFE6'
      
      	if(!item.selected && item.disabled){
      		styles['background-color'] = '#F2F6FC'
      		styles['border-color'] = item.selected?selectedColor:'#DCDFE6'
      	}
      
      	for (let i in styles) {
      		classles += `${i}:${styles[i]};`
      	}
      	return classles
      }
      
      function setStyleIconText(item) {
      	let styles = {};
      	let classles = '';
      	let selectedColor = props.selectedColor?props.selectedColor:'#2979ff'
      	if (props.mode === 'tag') {
      		styles.color = item.selected?(props.selectedTextColor?props.selectedTextColor:'#fff'):'#666'
      	} else {
      		styles.color = item.selected?(props.selectedTextColor?props.selectedTextColor:selectedColor):'#666'
      	}
      	if(!item.selected && item.disabled){
      		styles.color = '#999'
      	}
      
      	for (let i in styles) {
      		classles += `${i}:${styles[i]};`
      	}
      	return classles
      }
      
      function setStyleRightIcon(item) {
      	let styles = {}
      	let classles = ''
      	if (props.mode === 'list') {
      		styles['border-color'] = item.selected?styles.selectedColor:'#DCDFE6'
      	}
      	for (let i in styles) {
      		classles += `${i}:${styles[i]};`
      	}
      	return classles
      }
      
      return {
        dataList,
        range,
        change,
      };
    }
  }
</script>

<style lang="scss" scoped>
  @import './jui-check-list.scss';
</style>
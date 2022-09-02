<template>
  <view 
    class="jui-form"
    :class="{ 'uni-forms--top': !border }"
  >
    <form>
      <jui-form-group
        v-for="(group, gindex) in formItems" 
        :key="gindex">
        <view class="group__content">
          <view class="form-item__wrap" v-for="(item, index) in group.children" :key="index">
            <template v-if="hideFormItems[item.field] !== true">
              <jui-sub-form
                v-if="item.component === 'sub-form'"
                @add="onAddSub(item)"
                @minus="onMinusSub"
                :labelWidth="labelWidth"
                :item="item"
                :modelValue="formData[item.field]"
                :formErrMsg="formErrMsg"
                :onItemUpdateValue="onItemUpdateValue"
              >
              </jui-sub-form>
              <jui-config-form
                v-else
                :item="item"
                :formErrMsg="formErrMsg"
                :formData="formData"
                :onItemUpdateValue="onItemUpdateValue"
              >
              </jui-config-form>
            </template>
          </view>
        </view>
      </jui-form-group>
    </form>
    <view class="jui-form-btns is-fixed is--bottom">
      <view class="jui-form-btns_wrap">
        <slot name="btns">
          <view class="btn-item" v-if="showBtns.reset">
            <button class="btn btn-reset" @click="onReset()">{{ showBtns.reset.text }}</button>
          </view>
          <view class="btn-item" v-if="showBtns.submit">
            <button class="btn btn-submit" @click="onSubmit()">{{ showBtns.submit.text }}</button>
          </view>
        </slot>
      </view>
    </view>
    <uni-popup ref="subPopup" type="bottom" background-color="#fff">
      <!-- 防止死循环 -->
      <jui-form 
        v-if="currentSubSchemas.length > 0"
        @submit="onSubSubmit"
        @reset="onSubReset"
        :schemas="currentSubSchemas"
        :btns="{ submit: { text: '确认' }, reset: { text: '取消' } }"
      >
      </jui-form>
    </uni-popup>
  </view> 
</template>
  
<script>
  import { watch, computed, reactive, toRaw, ref } from 'vue';
  import Validator from './validate.js';
  import { debounce, throttle } from './util.js';
  export default {
    emits:['update:modelValue','reset','validate','submit','changeItem'],
    props: {
      modelValue: {
				type: Object,
				default () {
					return {}
				}
      },
      schemas: {
        type: Array,
        default: []
      },
      // label 宽度，单位 px
      labelWidth: {
      	type: [String, Number],
      	default: '160rpx'
      },
      // label 居中方式，可选值 left/center/right
      labelAlign: {
      	type: String,
      	default: 'left'
      },
      showMessage: {
        type: Boolean,
        default: true,
      },
      inlineMessage: {
        type: Boolean,
        default: false,
      },
      border: {
        type: Boolean,
        default: false
      },
      btns: { //是否需要操作按钮
        type: [Object, Boolean],
        default: true,
      },
      validateConfig: {
        type: Object,
      }
    },
    setup(props, { expose, emit }) {

      //存放验证规则
      let formRules = {};
      
      //表单校验器
      let validator = null;
      
      //所有表单的值
      const formData = reactive({});
      
      //缓存默认的值
      const cacheDefaultValue = {};
      
      //所有表单的错误信息
      const formErrMsg = reactive({});
      
      //缓存二级表单配置
      const cacheSubForm = {};
      
      //当前需要录入的子表表单配置
      const currentSubSchemas = ref([]);
      
      let currentSubField = '';
      
      //控制隐藏的表单
      const hideFormItems = reactive({})
      
      const subPopup = ref(null);
      
      //默认需要展示的按钮配置
      const defaultBtns = {
        'submit': { text: '提交' },
        'reset': { text: '重置' }
      };
      
      const showBtns = computed(() => {
        const { btns } = props;
        if (btns === false) {
          return {};
        } else if(btns === true) {
          return defaultBtns;
        }
        return btns ? btns : {};
      })
      
      const validConfig = computed(() => {
        const { validateConfig } = props;
        return Object.assign({
          debounce: 100, //验证防抖的时间
          errShowType: '', //错误的显示方式
        }, validateConfig);
      })
      
      const formItems = computed(() => {
        let tempItems = [];
        if (props.schemas.length > 0) {
          let group = [];
          let curGroupTitle = '';
          let isShowGroup = true;
          for (const item of props.schemas) {
            if (item.type == 'group') { //如果是分组需要建立分组
              if (group.length > 0 && isShowGroup) {
                //添加上一个值
                tempItems.push({ title: curGroupTitle, children: [ ...group ] });
                group = [];
              }
              isShowGroup = true;
              //是否需要显示formItems
              if (item.show === false) {
                isShowGroup = false;
              }
              curGroupTitle = item.label;
              continue;
            }
            if(!item.itemProps) {
              item.itemProps = {};
            }
            if(!isShowGroup) {
              continue;
            }
            if(item.show !== false) {
              group.push(item);
            }
          }
          if( group.length > 0 ) {
            tempItems.push({title: curGroupTitle, children: [ ...group ]});
          }
        }
        return tempItems;
      })
      
      watch(() => props.modelValue, (newValue) => {
        Object.keys(newValue).forEach((key) => {
          if(typeof formData[key] === 'undefined' 
            || newValue[key] !== formData[key]) { //不一样
            setValue(key, newValue[key]);
          }
        })
      }, {
        immediate: true,
        deep: true,
      })
      
      watch(() => props.schemas, (newSchemas) => {
        if(newSchemas && newSchemas.length > 0) {
          let rules = {};
          for (const item of props.schemas) {
            if (item.rules && item.rules.length > 0) {
              rules[item.field] = { rules: [ ...item.rules ] }
            }
            //是否隐藏
            if(item.hide === true) {
              hideFormItems[item.field] = true;
            } else {
              hideFormItems[item.field] = false;
            }
            //添加必填校验到验证规则里面
            if (item.required === true) {
              if(rules[item.field] && rules[item.field].rules) {
                let hasRequied = rules[item.field].rules.find((rule) => {
                  return rule.required === true;
                })
                if(!hasRequied) {
                  rules[item.field].rules.push({ required: true, errorMessage: `${item.label}的值不能为空` });
                }
              } else {
                rules[item.field] = { rules: [ { required: true, errorMessage: `${item.label}的值不能为空` } ] };
              }
            }
            if(typeof item.defaultValue !== 'undefined') {
              cacheDefaultValue[item.field] = item.defaultValue;
              formData[item.field] = item.defaultValue;
            }
          }
          formRules = rules;
          validator = new Validator(formRules);
        }
      }, {
        immediate: true,
      })
      
      //缓存防抖节流tiemer
      const cacheTimer = {};
      
      /**
       * 单独触发某一项认证
       * @param {Object} name
       * @param {Object} value
       */
      async function validate(name, value) {
        //如果都没有停止校验
        if ((!validator || Object.keys(formRules).length === 0)) return;
        //没有验证规则
        if(!formRules[name]) return;
        const isNoField = isRequired(formRules[name].rules || []);
        let result = null;
        if (!isNoField && (value === undefined || value === '')) {
          result = null;
        } else {
          result = await validator.validateUpdate({
            [name]: getValue(name, value),
          }, formRules);
        }
        if (result) { //处理错误信息
          formErrMsg[name] = result;
        } else { //移除错误验证
          delete formErrMsg[name];
        }
      }
      
      /**
       * 校验所有表单参数
       */
      async function validateAll() {
        for (const item of props.schemas) {
          if (item.type === 'group' || !item.field) { //需要触发验证
            continue;
          }
          await validate(item.field, formData[item.field]);
        }
        let tempErrs = [];
        Object.keys(formErrMsg).forEach((key) => {
          if(formErrMsg[key] && formErrMsg[key]!=='') {
            tempErrs.push(formErrMsg[key]);
          }
        })
        if(tempErrs.length > 0) {
          return tempErrs;
        }
        return null;
      }

      //防抖执行表单验证
      function debValidate(name, value, wait) {
        let func = validate.bind(this, name, value);
        if(cacheTimer[name] != null ) { //重新更行函数的执行
          clearTimeout(cacheTimer[name]);
        }
        cacheTimer[name] = setTimeout(() => {
          func();
          cacheTimer[name] = null;
        }, wait);
      }
      
			/**
			 * 公开给用户使用，同时子组件的改变会主动触发这个值
			 * 设置自定义表单组件 value 值
			 *  @param {String} name 字段名称
			 *  @param {String} value 字段值
			 */
      async function setValue(name, value) {
        formData[name] = value;
        debValidate(name, value, validConfig.value.debounce);
        emit('changeItem', { name: name, value: value, formModel: toRaw(formData) });
      }
      
      /**
       * 把 value 转换成指定的类型
       * @param {Object} name
       * @param {Object} value
       */
      function getValue(name, value) {
        const rules = (formRules[name] && formRules[name].rules) || [];
        const isRuleNum = rules.find(val => val.format && type_filter(val.format));
        const isRuleBool = rules.find(val => (val.format && val.format === 'boolean') || val.format === 'bool');
        // 输入值为 number
        if (isRuleNum) {
          value = isNaN(value) ? value : value === '' || value === null ? null : Number(value);
        }
        // 简单判断真假值
        if (isRuleBool) {
          value = !value ? false : true;
        }
        return value;
      }
      
      function type_filter(format) {
      	return format === 'int' || format === 'double' || format === 'number' || format === 'timestamp';
      }
      
      function onItemUpdateValue(name, value) {
        setValue(name, value);
      }
      
      // 是否有必填字段
      function isRequired(rules) {
      	let isNoField = false;
      	for (let i = 0; i < rules.length; i++) {
      		const ruleData = rules[i];
      		if (ruleData.required) {
      			isNoField = true;
      			break;
      		}
      	}
      	return isNoField;
      }
      
      //重置表单
      function resetForm() {
        Object.keys(formData).forEach((key) => {
          if(cacheDefaultValue[key]) {
            formData[key] = cacheDefaultValue[key];
            return;
          }
          delete formData[key];
        })
        clearValidate();
        emit('reset');
      }
      
      //提交表单
      async function submitForm() {
        const validate = await validateAll();
        emit('submit', {
          error: validate,
          data: toRaw(formData),
        });
      }
      
      const submitFormFun = throttle(submitForm, validConfig.value.debounce);
      const resetFormFun = throttle(resetForm, validConfig.value.debounce);
      
      function onSubmit() {
        submitFormFun();
      }
      
      function onReset() {
        resetFormFun();
      }
      
      //关于子表单的操作
      function onAddSub(item) {
        if(item.schemas && item.schemas.length > 0) {
          currentSubField = item.field;
          currentSubSchemas.value = item.schemas;
          subPopup.value.open();
        }
      }

      function onMinusSub({index, field}) {
        if (index >= 0 && formData[field].length > 0) {
          formData[field].splice(index, 1);
        }
      }
      
      function closeSubPopup() {
        subPopup.value.close();
        //清空子表单 
        currentSubSchemas.value = [];
      }
      
      function onSubSubmit(event) {
        if(event.error && event.error.length > 0) {
          return;
        }
        if(event.data) {
          if(formData[currentSubField]) { //
            formData[currentSubField].push({ ...event.data });
          } else {
            formData[currentSubField] = [ {...event.data } ];
          }
          closeSubPopup();
        }
      }
      
      function onSubReset() {
        closeSubPopup();
      }
      
      /**
       * 移除表单项的校验结果。传入待移除的表单项的 fields 属性或者 fields 组成的数组，如不传则移除整个表单的校验结果
       */
      function clearValidate(fields) {
        if(fields) { //移除部分校验
          if (typeof fields === 'array') {
            fields.forEach((field) => {
              delete formErrMsg[field];
            })
          } else {
            delete formErrMsg[fields];
          }
        } else {
          //清除所有的验证错误的值
          Object.keys(formErrMsg).forEach((key) => {
            delete formErrMsg[key];
          })
        }
      }
      
      function setShow(name) {
        if(Array.isArray(name)) {
          name.forEach((key) => {
            hideFormItems[key] = false;
          })
        } else {
          hideFormItems[name] = false
        }
      }
      
      function setHide(name) {
        if(Array.isArray(name)) {
          name.forEach((key) => {
            hideFormItems[key] = true;
          })
        } else {
          hideFormItems[name] = true;
        }
      }
      
      //对外开放的函数
      expose({
        setShow,
        setHide,
        setValue,
        submit: submitForm,
        reset: resetForm
      });
      
      return {
        formItems,
        onItemUpdateValue,
        formData,
        formErrMsg,
        throttle,
        submitForm,
        resetForm,
        onSubmit,
        onReset,
        currentSubSchemas,
        onAddSub,
        onMinusSub,
        subPopup,
        onSubSubmit,
        onSubReset,
        showBtns,
        hideFormItems
      }
    }
  }
</script>
  
<style lang="scss" scoped>
  .jui-form {
    display: flex;
    flex-direction: column;
    padding-bottom: 80px;
  }
  .jui-form-btns {
    height: 66px;
    &.is-fixed {
      position: fixed;
      left: 0;
      background-color: #ffffff;
      width: 100%;
      &.is--bottom {
        bottom: 0;
      }
    }
    .jui-form-btns_wrap {
      padding: 20rpx 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .btn-item {
        width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
      }
    }
    .btn {
      width: 90%;
      position: relative;
      border: 0 !important;
      border-radius: 6rpx;
      padding-left: 0;
      padding-right: 0;
      overflow: visible;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      box-shadow: none;
      &.btn-reset {
        background-color: #dd524d;
        color: #ffffff;
      }
      &.btn-submit {
        background-color: #007aff;
        color: #ffffff;
      }
    }
  }
</style>
